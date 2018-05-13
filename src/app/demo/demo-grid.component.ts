import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GridView, DetailGridView, CellArguments } from '../../lib/gridview/gridview';
import { DataColumn, ButtonColumn, TextAreaColumn, SelectColumn, NumericColumn } from '../../lib/gridview/gridview-columns';
import { FilterMode, FieldType, PrintOrientation } from '../../lib/gridview/gridview-enums';
import { SortDirection } from '../../lib/shared';
import { TypeaheadModule } from '../../lib/typeahead';
import { MultiTextboxModule } from '../../lib/multi-textbox';
import { Event } from './classes';
import {
	CustomerCellTemplateComponent, CoordinatorFilterCellTemplateComponent, EventTypeFilterCellTemplateComponent, RequestedByFilterCellTemplateComponent, CustomerCellEditTemplateComponent
} from './grid-cell-templates.component';
import { RoomComponent } from './room.component';
import { Observable } from 'rxjs/Observable';
import { RowArguments } from '../../lib/gridview/index';
import moment from 'moment-timezone-es6';

declare var EVENTS: Array<Event>;
@Component({
	selector: 'demo-grid',
	template: `
<gridview [grid]='gridDemo' (pageChanged)='pageChanged()'></gridview>
<br /><br /><br /><br />
<input type="checkbox" [(ngModel)]='gridDemo.allowEdit' />Allow Edit
<input type="checkbox" [(ngModel)]='gridDemo.visible' />Grid Visible
<input type="checkbox" [(ngModel)]='gridDemo.hideEditDeleteButtons' />Hide Edit Delete
<br />
Height: <input type="text" [(ngModel)]='gridDemo.height' />
<button (click)="gridDemo.printGrid()">Print</button>
`
})
export class DemoGridComponent implements OnInit {
	gridDemo: GridView;
	private _coordinatorColumn: DataColumn;
	private _selOptions = [
		{ id: 0, display: "TEST ZERO" },
		{ id: 1, display: "TEST ONE" },
		{ id: 2, display: "TEST TWO" },
		{ id: 3, display: "TEST THREE" },
	];


	constructor(private route: ActivatedRoute) {
		this.initGrid();
		moment.tz.setDefault("America/Los_Angeles");
	}

	ngOnInit() {
		this.gridDemo.data = EVENTS;
		for (let i = 0; i < this.gridDemo.data.length; i++) {
			this.gridDemo.data[i].test = this._selOptions[i % 4];
			this.gridDemo.data[i].testId = this.gridDemo.data[i].test.id;
		}
		if (this._coordinatorColumn)
			this._coordinatorColumn.customProps["coordinators"] = this.gridDemo.getDistinctValues(this._coordinatorColumn);

		if (this.gridDemo.autoPopulateColumns)
			window.setTimeout(() => {
				this.gridDemo.loadGridState();
			}, 100);
	}

	private initGrid() {
		this.gridDemo = new GridView();
		// this.gridDemo.timezone = "America/Los_Angeles";
		this.gridDemo.pageSize = 20;
		this.gridDemo.filterVisible = true;
		this.gridDemo.allowColumnOrdering = true;
		// this.gridDemo.saveGridStateToStorage = true;
		this.gridDemo.allowColumnCustomization = true;
		this.gridDemo.allowEdit = true;
		this.gridDemo.printSettings.orientation = PrintOrientation.Landscape;
		this.gridDemo.printSettings.fontSize = "10px";
		this.gridDemo.printSettings.cellPadding = "20px";
		this.gridDemo.rowInvalidated.subscribe(((columns: DataColumn[]) => {
			for (let c of columns) {
				alert(c.fieldName);
			}
		}));

		this.gridDemo.rowCancelled.subscribe((a: RowArguments) => {
			console.log("A:", a.row);
		});

		if (!this.route.snapshot.params['auto']) {
			this.gridDemo.name = "gridDemo";
			let custCol = new DataColumn("customer.customerName");
			custCol.filterMode = FilterMode.DistinctList;
			custCol.width = "320px";
			custCol.sortable = true;
			// custCol.allowSizing = true;
			// custCol.template = CustomerCellTemplateComponent;
			// custCol.editTemplate = CustomerCellEditTemplateComponent;
			custCol.required = true;
			this.gridDemo.columns.push(custCol);

			let startCol = new DataColumn("eventStartDT", "Start");
			startCol.fieldType = FieldType.Date;
			startCol.sortable = true;
			startCol.sortDirection = SortDirection.Desc;
			startCol.width = "110px";
			startCol.printWidth = "90px";

			startCol.filterMode = FilterMode.DateRange;
			this.gridDemo.columns.push(startCol);

			let startTime = new DataColumn("eventStartDT", "Start");
			startTime.fieldType = FieldType.Time;
			startTime.sortable = true;
			startTime.sortDirection = SortDirection.Desc;
			startTime.width = "110px";
			startTime.printWidth = "90px";
			this.gridDemo.columns.push(startTime);

			let endCol = new DataColumn("eventEndDT", "End");
			endCol.fieldType = FieldType.Date;
			endCol.width = "110px";
			endCol.filterMode = FilterMode.DateRange;
			endCol.printVisible = false;
			this.gridDemo.columns.push(endCol);

			this._coordinatorColumn = new DataColumn("coordinator");

			this._coordinatorColumn.filterMode = FilterMode.Equals;
			this._coordinatorColumn.filterTemplate = CoordinatorFilterCellTemplateComponent;
			this._coordinatorColumn.sortable = true;
			this._coordinatorColumn.allowSizing = true;
			this.gridDemo.columns.push(this._coordinatorColumn);

			const phoneNumCol = new DataColumn("phoneNumber").setWidth("160px").setFilterMode(FilterMode.Contains);
			phoneNumCol.printWidth = "100px";
			this.gridDemo.columns.push(phoneNumCol);

			let evtTypeCol = new SelectColumn("hallEventType", "Event Type");
			evtTypeCol.filterMode = FilterMode.DynamicList;
			evtTypeCol.filterValue = [];
			evtTypeCol.filterTemplate = EventTypeFilterCellTemplateComponent;
			const eventTypes = [];
			for (let e of EVENTS) {
				if (e.hallEventType && !eventTypes.find(et => et.id == e.hallEventType.id)) eventTypes.push(Object.assign({}, e.hallEventType));
			}
			evtTypeCol.selectOptions = eventTypes;
			evtTypeCol.allowSizing = true;
			evtTypeCol.displayMember = "eventTypeName";
			evtTypeCol.render = (row: any) => `The event type is ${row.hallEventType.eventTypeName}`;
			evtTypeCol.readonly = true;
			this.gridDemo.columns.push(evtTypeCol);

			// let requestedByCol = new DataColumn("requestedBy");
			// requestedByCol.filterMode = FilterMode.DistinctList;
			// requestedByCol.filterValue = [];
			// //requestedByCol.filterTemplate = RequestedByFilterCellTemplateComponent;
			// requestedByCol.sortable = true;
			// this.gridDemo.columns.push(requestedByCol);

			// let commentsCol = new TextAreaColumn("comments");
			// this.gridDemo.columns.push(commentsCol);

			// let cancelledCol = new DataColumn("cancelled");
			// cancelledCol.fieldType = FieldType.Boolean;
			// this.gridDemo.columns.push(cancelledCol);

			// let buttonCol = new ButtonColumn();
			// buttonCol.text = "DUMMY";
			// this.gridDemo.columns.push(buttonCol);

			let testCol = new SelectColumn("testId", "Test Sel");
			testCol.name = "testSelCol";
			testCol.selectOptions = this._selOptions;
			testCol.displayMember = "display";
			testCol.sortable = true;
			testCol.filterMode = FilterMode.Contains;
			testCol.valueMember = "id";
			testCol.addBlank = true;
			testCol.getRowCellStyle = (row: any) => { return { 'fontWeight': 'bold', 'color': 'white', 'backgroundColor': 'red' } };
			this.gridDemo.columns.push(testCol);

			let testColObj = new SelectColumn("test", "Test Sel Obj");
			testColObj.name = "testSelObjCol";
			testColObj.sortable = true;
			testColObj.selectOptions = this._selOptions;
			testColObj.displayMember = "display";
			testColObj.filterMode = FilterMode.Contains;
			testColObj.printVisible = false;
			this.gridDemo.columns.push(testColObj);

			const test2Col = new NumericColumn("testId");
			test2Col.name = "testIdCol";
			test2Col.printVisible = false;
			test2Col.visible = false;
			this.gridDemo.columns.push(test2Col);

			this.gridDemo.cellValueChanged.subscribe((args: CellArguments) => {
				if (args.column.name == testCol.name || args.column.name == test2Col.name) {
					args.row.test = this._selOptions.find(o => o.id == args.row.testId);
				}
				else if (args.column.name == testColObj.name) {
					args.row.testId = args.row.test.id;
				}
			})
		}
		else {
			this.gridDemo.name = "autoGridDemo";
			this.gridDemo.autoPopulateColumns = true;
		}

		this.gridDemo.keyFieldName = "id";

		let roomsDetailGridView = new DetailGridView();
		roomsDetailGridView.rowTemplate = RoomComponent;
		roomsDetailGridView.getChildData = (parentRow: any) => {
			let evt = <Event>parentRow;
			if (!evt.hallRequestRooms)
				evt.hallRequestRooms = [];
			return Observable.create(o => o.next(evt.hallRequestRooms));
		}
		this.gridDemo.detailGridView = roomsDetailGridView;

		if (!this.gridDemo.autoPopulateColumns)
			this.gridDemo.loadGridState();
	}

	pageChanged() {
	}
}