import { EventEmitter, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnBase, DataColumn } from './gridview-columns';
import { SelectMode, PagingType, FilterMode, FieldType, PrintOrientation } from './gridview-enums';
import { IGridViewRowTemplateComponent, IGridViewComponent } from './gridview-interfaces';
import { ParserService } from '../services/parser.service';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { SortDirection } from '../shared';
import newGuid from '../utils/newGuid';

export const TEMP_KEY_FIELD: string = "_tmp_key_field";

export class GridView {
	private _data: Array<any>;


	pageSize: number = 10;
	currentPage: number = 1;
	totalRecords: number;
	columns: Array<ColumnBase> = [];
	showHeader: boolean = true;
	allowRowSelect = false;
	visible = true;
	detailGridView: DetailGridView;
	keyFieldName: string;
	selectMode: SelectMode;
	disableAutoSort: boolean;
	disableAutoFilter: boolean;
	pagingType: PagingType = PagingType.Auto;
	height: string;
	width: string;
	dataChanged: EventEmitter<any> = new EventEmitter<any>();
	rowEdit = new EventEmitter<RowArguments>();
	rowCancelled = new EventEmitter<RowArguments>();
	rowSave = new EventEmitter<RowArguments>();
	rowSaveAll = new EventEmitter<RowArguments>();
	rowCreate = new EventEmitter<RowArguments>();
	rowDelete = new EventEmitter<RowArguments>();
	cellValueChanged = new EventEmitter<CellArguments>();
	rowInvalidated = new EventEmitter<DataColumn[]>();
	rowTemplate: Type<IGridViewRowTemplateComponent>;
	customProps: { [name: string]: any; } = {};
	customEvents: any = {};
	filterVisible: boolean;
	disableFilterRow: boolean;
	loading: boolean;
	showNoResults = true;
	allowColumnOrdering = false;
	allowColumnCustomization = false;
	saveGridStateToStorage = false;
	gridStateVersion = 0;
	allowAdd = false;
	allowEdit = false;
	allowDelete = false;
	autoPopulateColumns = false;
	allowMultiEdit = false;
	noBorder = false;
	// showFooter = false;
	name: string;
	timezone: string;
	gridViewComponent: IGridViewComponent;
	getRowClass: (row: any) => string;
	printing = false;
	printSettings = new PrintSettings();

	getDataColumns(): Array<DataColumn> {
		let cols: Array<DataColumn> = [];
		for (let col of this.columns) {
			if (col instanceof DataColumn) {
				cols.push(<DataColumn>col);
			}
		}
		return cols;
	}

	getVisibleColumns(hideRowTemplate = false): Array<ColumnBase> {

		let cols = new Array<ColumnBase>();
		for (let c of this.columns) {
			if (((this.printing && c.printVisible) || (!this.printing && c.visible)) && (!hideRowTemplate || !this.rowTemplate))
				cols.push(c);
		}
		return cols;
	}

	getDistinctValues(column: DataColumn): any[] {
		if (!column.fieldName) return null;
		if (!this._data) return null;

		let parserService = new ParserService();

		let vals: any[] = [];
		for (let i = 0; i < this._data.length; i++) {

			let val = parserService.getObjectValue(column.fieldName, this._data[i]);
			if (vals.indexOf(val) < 0)
				vals.push(val);
		}
		vals.sort();
		return vals;
	}

	setFilterOptions() {
		for (let col of this.getDataColumns()) {
			if (col.filterMode == FilterMode.DistinctList) {
				col.filterOptions = this.getDistinctValues(col);
				col.filterOptionsChanged.emit(col);
			}
		}
	}

	refreshData() {
		this.dataChanged.emit(this);
		this.setFilterOptions();
	}

	get data(): Array<any> {
		return this._data;
	}
	set data(data: Array<any>) {
		this._data = data;
		this.populateTempKey();
		this.refreshData();
	}


	private _stateLoaded = false;
	private _defaultState: GridState;
	// TODO: where should this be called from?
	loadGridState() {
		if (this._stateLoaded || !this.saveGridStateToStorage) return;
		if (!this._defaultState) {
			let orderedCols = new OrderByPipe().transform(this.columns, ['columnIndex']);
			for (let i = 0; i < orderedCols.length; i++) {
				orderedCols[i].columnIndex = i;
			}
			this._defaultState = this.getGridState();
		}

		this._stateLoaded = true;
		let stateString = localStorage.getItem(this.name + this.gridStateVersion.toString());
		if (stateString) {
			let state = <GridState>JSON.parse(stateString);
			this.setGridState(state);
			return true;
		}
		return false;
	}

	private getFieldName(obj: any, currField: string): string {
		let objVal = obj[currField];
		if (typeof objVal == "object") {
			for (let p in objVal) {
				return currField + "." + this.getFieldName(objVal, p);
			}
		}
		return currField;
	}

	populateColumns() {
		if (!this.data || this.data.length < 1) return;
		this.columns = [];
		let first = this.data[0];
		let parserService = new ParserService();
		for (let p in first) {
			let fldName = this.getFieldName(first, p);
			let col = new DataColumn(fldName);
			let firstVal = parserService.getObjectValue(fldName, first);
			switch (typeof firstVal) {
				case "boolean":
					col.fieldType = FieldType.Boolean;
					break;
			}
			this.columns.push(col);
		}
	}

	saveGridState() {
		if (!this.saveGridStateToStorage) return;

		if (!this.name)
			throw 'Grid name required to save to local storage';

		let state = this.getGridState();
		// TODO: is grid name too generic?
		localStorage.setItem(this.name + this.gridStateVersion.toString(), JSON.stringify(state));
	}

	resetGridState() {
		if (this._defaultState) {
			this.setGridState(this._defaultState);
			localStorage.removeItem(this.name + this.gridStateVersion.toString());

			// THIS SEEMS HACKISH! IN ORDER FOR THE COMPONENT TO REDRAW, IT NEEDS TO DETECT
			// A CHANGE TO THE COLUMNS VARIABLE ITSELF RATHER THAN WHAT'S IN THE COLLECTION
			let copies: Array<ColumnBase> = [];
			for (let c of this.columns) {
				copies.push(c);
			}

			this.columns = copies;
			this.refreshData();
		}
	}

	setTempKeyField() {
		this.keyFieldName = TEMP_KEY_FIELD;
		this.populateTempKey();
		if (this.detailGridView)
			this.detailGridView.setTempKeyField();
	}

	private populateTempKey() {
		if (this.keyFieldName != TEMP_KEY_FIELD || !this.data) return;
		for (let d of this.data) {
			if (!d[this.keyFieldName])
				d[this.keyFieldName] = newGuid();
		}
	}

	private getGridState(): GridState {
		let state = new GridState();
		state.currentPage = this.currentPage;
		state.pageSize = this.pageSize;
		state.filterVisible = this.filterVisible;

		for (let col of this.columns) {
			let colState = new GridColumnState();
			colState.identifier = col.getIdentifier();
			if (this.allowColumnOrdering)
				colState.columnIndex = col.columnIndex;
			colState.width = col.width;
			colState.visible = col.visible;
			if (col instanceof DataColumn) {
				let cd = <DataColumn>col;
				colState.sortDirection = cd.sortDirection;
				colState.sortIndex = cd.sortIndex;
				// all selected
				if (cd.filterValue instanceof Array && cd.filterOptions && cd.filterValue.length >= cd.filterOptions.length)
					colState.filterValue = null;
				else
					colState.filterValue = cd.filterValue;
			}
			state.gridColumnStates.push(colState);
		}

		return state;
	}

	private setGridState(state: GridState) {
		this.currentPage = state.currentPage;
		this.pageSize = state.pageSize;
		this.filterVisible = state.filterVisible;

		// make a clone as to not hinder original list
		let copy = new Array<ColumnBase>();
		for (let col of this.columns) {
			copy.push(col);
		}
		let orderedCols: Array<ColumnBase> = new OrderByPipe().transform(copy, ['-columnIndex']);

		let refilter = false;
		// lets set ordering, visibility, filtering first
		for (let col of orderedCols) {
			for (let colState of state.gridColumnStates) {
				if (col.getIdentifier() != colState.identifier) continue;
				if (this.allowColumnOrdering)
					col.columnIndex = colState.columnIndex;
				col.visible = colState.visible;
				if (col instanceof DataColumn) {
					let cd = <DataColumn>col;
					cd.sortDirection = colState.sortDirection;
					cd.sortIndex = colState.sortIndex;
					if (colState.filterValue instanceof Array) {
						if (colState.filterValue.length > 0) {
							cd.filterValue = colState.filterValue;
							refilter = true;
						}
					}
					else if (colState.filterValue) {
						cd.filterValue = colState.filterValue;
						refilter = true;
						if (col.filterMode == FilterMode.DateRange) {
							if (col.filterValue.fromDate)
								col.filterValue.fromDate = new Date(col.filterValue.fromDate);
							if (col.filterValue.toDate)
								col.filterValue.toDate = new Date(col.filterValue.toDate);
						}
					}
					else if (cd.filterValue) {
						cd.filterValue = null;
						refilter = true;
					}
				}
				break;
			}
		}

		// handle outside of control
		//if (refilter) {
		//	window.setTimeout(() => this.dataChanged.emit(this), 100);
		//}

		// recalculate indices in case we have duplicates
		orderedCols = new OrderByPipe().transform(orderedCols, ['columnIndex']);
		if (this.allowColumnOrdering) {
			for (let i = 0; i < orderedCols.length; i++) {
				orderedCols[i].columnIndex = i;
			}
		}

		// we need the last column to be a floater, so after we've set indices correctly we can now
		// determine the true last column
		orderedCols = new OrderByPipe().transform(orderedCols, ['-columnIndex']);
		for (let i = 0; i < orderedCols.length; i++) {
			let col = orderedCols[i];
			for (let colState of state.gridColumnStates) {
				if (col.getIdentifier() != colState.identifier) continue;
				// last column is floater
				col.width = i == 0 ? "" : colState.width;
				break;
			}
		}
	}

	addRow() {
		this.gridViewComponent.addRow();
	}

	printGrid() {
		this.printing = true;
		let style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = `
		@media print {
			@page {
				size: ${this.printSettings.orientation == PrintOrientation.Portrait ? 'portrait' : 'landscape'}
			}
		}
		`;
		document.getElementsByTagName('head')[0].appendChild(style);

		window.setTimeout(() => {
			window.print();
			window.setTimeout(() => {
				document.getElementsByTagName('head')[0].removeChild(style);
				this.printing = false;
			}, 50)
		}, 100);
	}
}

export class DetailGridView extends GridView {

	getChildData: (parent: any) => Observable<Array<any>>;
	parentRow: any;
	hideExpandButton: boolean;

	createInstance(parentRow: any): DetailGridView {
		let grid = new DetailGridView();
		Object.assign(grid, this);
		grid.parentRow = parentRow;
		grid.showNoResults = false;
		return grid;
	}
}

// don't want to clutter storage with unneccessary info
export class GridState {
	gridColumnStates: Array<GridColumnState> = [];
	currentPage: number;
	pageSize: number;
	filterVisible: boolean;
}
export class GridColumnState {
	identifier: string;
	width: string;
	sortDirection: SortDirection;
	sortIndex: number;
	columnIndex: number;
	filterValue: any;
	visible: boolean;
}
export class RowArguments {
	grid: GridView;
	rows: any[];
	deletedRows: any[];
	cancel: boolean;
	observable: Observable<any>;
	get row(): any {
		return this.rows.length > 0 ? this.rows[0] : null;
	}
}
export class CellArguments {
	parentGridView: GridView;
	row: any;
	column: ColumnBase;
}
export class PrintSettings {
	orientation = PrintOrientation.Portrait;
	fontSize = "12px";
	cellPadding: string;
}