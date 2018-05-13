import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GridView, DetailGridView, CellArguments, RowArguments } from '../../lib/gridview/gridview';
import { DataColumn, ButtonColumn, TextAreaColumn, SelectColumn, NumericColumn } from '../../lib/gridview/gridview-columns';
import { FilterMode, FieldType, PagingType } from '../../lib/gridview/gridview-enums';
import { SortDirection } from '../../lib/shared';
import { TypeaheadModule } from '../../lib/typeahead';
import { MultiTextboxModule } from '../../lib/multi-textbox';
import { Event } from './classes';
import {
	CustomerCellTemplateComponent, CoordinatorFilterCellTemplateComponent, EventTypeFilterCellTemplateComponent, RequestedByFilterCellTemplateComponent, CustomerCellEditTemplateComponent
} from './grid-cell-templates.component';
import { RoomComponent } from './room.component';
import { Observable } from 'rxjs/Observable';
import moment from 'moment-timezone-es6';

declare var EVENTS: Array<Event>;
@Component({
	selector: 'demo-grid-basic',
	template: `
<gridview [grid]='gridDemo'></gridview>`
})
export class DemoGridBasicComponent implements OnInit {
	gridDemo: GridView;
	private _coordinatorColumn: DataColumn;

	constructor(private route: ActivatedRoute) {
		this.initGrid();
	}

	ngOnInit() {
		let i = 0;
		for (let e of EVENTS) {
			if (e.customer) e.customerId = e.customer.id;
			if (e.hallRequestRooms) {
				for (let r of e.hallRequestRooms) {
					r.hallRoomId = r.hallRoom.id;
				}
			}
			if (i % 5 == 0)
				e.eventStartDate = moment(e.eventStartDT.toString().substring(0, 10)).toDate();
			i++;
		}
		this.gridDemo.data = EVENTS;
	}

	private initGrid() {
		this.gridDemo = new GridView();
		this.gridDemo.allowEdit = true;
		this.gridDemo.allowAdd = true;
		this.gridDemo.allowDelete = true;
		this.gridDemo.allowMultiEdit = true;
		this.gridDemo.pagingType = PagingType.Disabled;
		this.gridDemo.rowCancelled.subscribe((a: RowArguments) => {
			console.log("A:", a.row);
		});

		let custCol = new SelectColumn("customerId");
		custCol.selectOptions = EVENTS.map(e => e.customer);
		custCol.displayMember = "customerName";
		custCol.valueMember = "id";
		custCol.width = "320px";
		custCol.required = true;
		this.gridDemo.columns.push(custCol);

		this.gridDemo.columns.push(new DataColumn("eventStartDate", "Start Date").setFieldType(FieldType.Date).setSortable());

		let startCol = new DataColumn("eventStartDT", "Start");
		startCol.fieldType = FieldType.Date;
		startCol.sortable = true;
		startCol.sortDirection = SortDirection.Desc;
		startCol.width = "110px";
		this.gridDemo.columns.push(startCol);

		let endCol = new DataColumn("eventEndDT", "End");
		endCol.fieldType = FieldType.Date;
		endCol.width = "110px";
		this.gridDemo.columns.push(endCol);

		this._coordinatorColumn = new DataColumn("coordinator");
		this._coordinatorColumn.sortable = true;
		this._coordinatorColumn.allowSizing = true;
		this.gridDemo.columns.push(this._coordinatorColumn);

		this.gridDemo.columns.push(new DataColumn("phoneNumber").setWidth("160px"));

		let evtTypeCol = new SelectColumn("hallEventType", "Event Type");
		const eventTypes = [];
		for (let e of EVENTS) {
			if (e.hallEventType && !eventTypes.find(et => et.id == e.hallEventType.id)) eventTypes.push(Object.assign({}, e.hallEventType));
		}
		evtTypeCol.selectOptions = eventTypes;
		evtTypeCol.allowSizing = true;
		evtTypeCol.displayMember = "eventTypeName";
		this.gridDemo.columns.push(evtTypeCol);

		let roomsDetailGridView = new DetailGridView();
		roomsDetailGridView.allowAdd = true;
		roomsDetailGridView.allowEdit = true;
		roomsDetailGridView.allowDelete = true;
		const hallRoomCol = new SelectColumn("hallRoomId", "Room");
		hallRoomCol.displayMember = "roomName";
		hallRoomCol.valueMember = "id";
		hallRoomCol.required = true;
		const rooms = []
		for (let e of EVENTS) {
			for (let r of e.hallRequestRooms) {
				rooms.push(r.hallRoom);
			}
		}
		hallRoomCol.selectOptions = rooms;
		roomsDetailGridView.columns.push(hallRoomCol);

		roomsDetailGridView.columns.push(new DataColumn("isPrimaryChoice").setFieldType(FieldType.Boolean));

		roomsDetailGridView.getChildData = (parentRow: any) => {
			let evt = <Event>parentRow;
			if (!evt.hallRequestRooms)
				evt.hallRequestRooms = [];
			return Observable.create(o => o.next(evt.hallRequestRooms));
		}
		this.gridDemo.detailGridView = roomsDetailGridView;

		this.gridDemo.rowSave.subscribe((r: RowArguments) => {
			for (let rm of r.row.hallRequestRooms) {
				console.log("R:", r.row);
				if (rm.hallRoomId == 1) {
					r.cancel = true;
					alert('nope');
				}
			}
		})
	}

	pageChanged() {
	}
}