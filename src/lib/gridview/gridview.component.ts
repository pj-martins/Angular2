import { Component, Input, Output, EventEmitter, NgZone, AfterViewInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { GridView, GridState, RowArguments, TEMP_KEY_FIELD } from './gridview';
import { DataColumn, ColumnBase, SelectColumn } from './gridview-columns'
import { IDetailGridViewComponent, IGridViewComponent } from './gridview-interfaces'
import { SelectMode, FilterMode, PagingType, FieldType } from './gridview-enums'
import { SortDirection } from '../shared';
import { GridViewPagerComponent } from './gridview-pager.component';
import { GridViewHeaderCellComponent } from './gridview-headercell.component';
import { ParserService } from '../services/parser.service';
import { Utils } from '../shared';
import { Observable } from 'rxjs/Observable';
import { CellArguments } from '../index';
import moment from 'moment-es6';

@Component({
	selector: 'gridview',
	styleUrls: ['../assets/css/styles.css', '../assets/css/icons.css', '../assets/css/buttons.css', 'gridview.css'],
	templateUrl: 'gridview.component.html'
})
export class GridViewComponent implements AfterViewInit, IGridViewComponent {
	private _grid: GridView;

	protected selectedKeys: { [keyFieldValue: string]: boolean } = {};

	protected uniqueId = Utils.newGuid();

	@Input()
	parentGridViewComponent: GridViewComponent;

	@Input() get grid(): GridView {
		return this._grid;
	}
	set grid(value: GridView) {
		if (this._grid != null) {
			this._grid.dataChanged.unsubscribe();
		}
		this._grid = value;
		if (this._grid != null) {
			if (this._grid.detailGridView && !this._grid.keyFieldName) {
				this._grid.setTempKeyField();
			}
			if (this._grid.selectMode > 0 && !this._grid.keyFieldName) {
				this._grid.setTempKeyField();
			}
			if (this._grid.allowEdit && !this._grid.keyFieldName) {
				this._grid.setTempKeyField();
			}
			this._grid.dataChanged.subscribe(() => this.resetData());
			this.initPager();
			this._grid.gridViewComponent = this;
		}
	}

	@Input() parentComponent: any;

	private _pager: GridViewPagerComponent;
	@ViewChild(GridViewPagerComponent)
	get pager(): GridViewPagerComponent {
		return this._pager;
	}
	set pager(v: GridViewPagerComponent) {
		this._pager = v;
		this.initPager();
	}

	private initPager() {
		if (!this.pager || !this._grid) return;

		let pageFound = false;
		for (let pageSize of this.pager.pageSizes) {
			if (pageSize.size == this._grid.pageSize) {
				pageFound = true;
				break;
			}
		}

		if (!pageFound) {
			this.pager.pageSizes.push({ size: this._grid.pageSize, label: this._grid.pageSize.toString() });
			this.pager.pageSizes.sort((a, b) => {
				if (a.size == 0) return 1;
				if (b.size == 0) return -1;
				if (a.size > b.size) return 1;
				if (a.size < b.size) return -1;
				return 0;
			});
		}
	}

	@ViewChildren(GridViewHeaderCellComponent)
	headerCells: QueryList<GridViewHeaderCellComponent>;

	@Output() sortChanged = new EventEmitter<DataColumn>();
	@Output() filterChanged = new EventEmitter<DataColumn>();
	@Output() pageChanged = new EventEmitter<any>();
	@Output() selectionChanged = new EventEmitter<any[]>();
	constructor(public parserService: ParserService, private zone: NgZone, public elementRef: ElementRef) { }

	newRows: { [tempKeyValue: string]: any } = {};
	editingRows: { [tempKeyValue: string]: any } = {};
	changedRows: { [tempKeyValue: string]: any } = {};
	deletedRows: { [tempKeyValue: string]: any } = {};
	detailGridViewComponents: { [tempKeyValue: string]: IDetailGridViewComponent } = {};
	showRequired: { [tempKeyValue: string]: boolean } = {};
	printing = false;

	protected promptConfirm: { [templateKeyValue: string]: boolean } = {};

	protected self: GridViewComponent = this;
	protected sortDirection = SortDirection;
	protected fieldType = FieldType;

	private _unpagedData: Array<any>;
	private _displayData: Array<any>;

	private resetData(resetPage: boolean = false) {
		let expandedKeys: Array<string> = [];
		if (this.detailGridViewComponents) {
			for (let k of Object.keys(this.detailGridViewComponents)) {
				if (this.detailGridViewComponents[k].isExpanded)
					expandedKeys.push(k);
			}
		}

		this._displayData = null;
		this._unpagedData = null;
		if (resetPage)
			this.grid.currentPage = 1;

		if (this.detailGridViewComponents) {
			this.collapseAll();

			if (expandedKeys && expandedKeys.length > 0) {
				for (let k of expandedKeys) {
					for (let d of this.displayData) {
						if (d[this.grid.keyFieldName] == k) {
							if (!this.detailGridViewComponents[k].isExpanded)
								this.detailGridViewComponents[k].expandCollapse();
							break;
						}
					}
				}
			}
		}
	}

	private updateBodyHeight() {
		if (!this.grid.showHeader || !this.grid.height) return;
		this.elementRef.nativeElement.getElementsByTagName("tbody")[0].style.height = "calc(100% - " +
			this.elementRef.nativeElement.getElementsByTagName("thead")[0].offsetHeight + "px)";
	}

	private updateHeight() {
		if (!this.grid.height || !this.grid.height.endsWith("%")) return;
		let el = document.getElementById("foot_" + this.uniqueId);
		if (!el) return;
		this.elementRef.nativeElement.firstElementChild.style.height = "calc(" + this.grid.height + " - " + (el.offsetHeight + 2) + "px)";
	}

	protected hasFilterRow() {
		if (this.grid.disableFilterRow) return false;
		for (let col of this.grid.getDataColumns()) {
			if (col.filterMode != FilterMode.None) {
				return true;
			}
		}
		return false;
	}

	protected editingRow(row: any) {
		return this.editingRows[row[this.grid.keyFieldName]];
	}

	protected get editing() {
		return this.adding || Object.keys(this.editingRows).length > 0;
	}

	protected get adding() {
		return Object.keys(this.newRows).length > 0;
	}

	private _indexWidthInited = false;
	protected getVisibleColumnCount(): number {
		if (this.grid.rowTemplate)
			return 1;

		let count = 0;
		for (let col of this.grid.columns) {
			if (!this._indexWidthInited && count != 0 && col.columnIndex == 0) {
				col.columnIndex = count;
			}
			if (col.visible) {
				count++;
			}
		}

		if (!this._indexWidthInited) {
			this._indexWidthInited = true;
		}
		return count;
	}

	//protected getCellWidth(col: ColumnBase, colIndex: number, rowIndex: number) {
	//	if (!this.grid.showHeader) return col.width;
	//	let headerCell = document.getElementById(`header_${colIndex}_${this.uniqueId}`);
	//	return headerCell.offsetWidth + 'px';
	//}

	ngAfterViewInit() {
		window.setTimeout(() => this.updateDimensions(), 100);
	}

	protected updateDimensions() {
		this.updateBodyHeight();
		this.updateHeight();
	}

	protected toggleFilter() {
		this.grid.filterVisible = !this.grid.filterVisible;
		this.grid.currentPage = 1;
		this.filterChanged.emit(null);
		this.grid.saveGridState();
		this.refreshDataSource();
	}

	protected rowClick(row) {
		if (this.grid.selectMode > 0) {
			this.selectedKeys[row[this.grid.keyFieldName]] = !this.selectedKeys[row[this.grid.keyFieldName]];

			if (this.grid.selectMode == SelectMode.Single && this.selectedKeys[row[this.grid.keyFieldName]]) {
				for (let d of this.grid.data) {
					if (d[this.grid.keyFieldName] != row[this.grid.keyFieldName]) {
						this.selectedKeys[d[this.grid.keyFieldName]] = false;
					}
				}
			}

			let selectedRows = [];
			for (let d of this.grid.data) {
				if (this.selectedKeys[d[this.grid.keyFieldName]])
					selectedRows.push(d);
			}

			this.selectionChanged.emit(selectedRows);
		}
	}

	protected handleSortChanged(column: DataColumn) {
		if (this.sortChanged)
			this.sortChanged.emit(column);

		this.resetData();
		if (this.grid.saveGridStateToStorage)
			this.grid.saveGridState();
	}

	private getSortedData(data: Array<any>): Array<any> {
		if (!data) return [];
		if (this.grid.disableAutoSort) return data;

		let sorts = new Array<DataColumn>();
		if (this.grid.columns) {
			for (let col of this.grid.getDataColumns()) {
				if (col.fieldName && col.sortDirection !== undefined && col.sortDirection != SortDirection.None) {
					if (col.sortIndex === undefined)
						col.sortIndex = 0;
					sorts.push(col);
				}
			}
		}

		if (sorts.length <= 0) {
			return data;
		}

		sorts.sort((a, b) => {
			return a.sortIndex - b.sortIndex;
		});

		data.sort((a, b) => {
			for (let i = 0; i < sorts.length; i++) {

				let curr = sorts[i];
				let aval = this.parserService.getObjectValue(curr.fieldName, a);
				let bval = this.parserService.getObjectValue(curr.fieldName, b);

				if (aval != null && aval !== undefined && bval != null && bval != undefined && sorts[i] instanceof SelectColumn) {
					const col = <SelectColumn>sorts[i];
					if (col.valueMember && col.displayMember) {
						const opta = col.selectOptions.find(o => o[col.valueMember] == aval);
						const optb = col.selectOptions.find(o => o[col.valueMember] == bval);
						if (opta && optb) {
							aval = opta[col.displayMember];
							bval = optb[col.displayMember];
						}
					}
					else if (col.displayMember) {
						const opta = col.selectOptions.find(o => o[col.displayMember] == aval[col.displayMember]);
						const optb = col.selectOptions.find(o => o[col.displayMember] == bval[col.displayMember]);
						if (opta && optb) {
							aval = opta[col.displayMember];
							bval = optb[col.displayMember];
						}
					}
				}

				if (curr.customSort) {
					var s = curr.customSort(aval, bval);
					if (s != 0)
						return s;
				}

				if (curr.fieldType == FieldType.Date) {
					const multiplier = curr.sortDirection == SortDirection.Desc ? -1 : 1;
					if (!aval && !bval) return 0;
					if (!aval) return multiplier * -1;
					if (!bval) return multiplier * 1;
					if (moment(aval).isBefore(moment(bval))) return multiplier * -1;
					if (moment(aval).isAfter(moment(bval))) return multiplier * 1;
					return 0;
				}

				if (aval && typeof aval == "string") aval = aval.toLowerCase();
				if (bval && typeof bval == "string") bval = bval.toLowerCase();

				if (aval == bval)
					continue;

				if (curr.sortDirection == SortDirection.Desc)
					return aval > bval ? -1 : 1;

				return aval < bval ? -1 : 1;
			}

			return 0;
		});

		return data;
	}

	private getFilteredData(rawData: Array<any>): Array<any> {
		if (this.grid.disableAutoFilter) return rawData;
		if (!this.grid.filterVisible && !this.grid.disableFilterRow) return rawData;

		if (!rawData) return [];
		let filteredData: Array<any> = [];
		for (let row of rawData) {
			if (this.showRow(row))
				filteredData.push(row);
		}
		return filteredData;
	}

	get unpagedData(): Array<any> {
		if (!this._unpagedData || this._unpagedData.length < 1) {
			this._unpagedData = this.getFilteredData(this.getSortedData(this.grid.data));
		}
		return this._unpagedData;
	}

	expandAll() {
		for (let row of this.displayData) {
			if (!this.detailGridViewComponents[row[this.grid.keyFieldName]].isExpanded)
				this.detailGridViewComponents[row[this.grid.keyFieldName]].expandCollapse();
		}
	}

	collapseAll() {
		for (let row of this.displayData) {
			if (this.detailGridViewComponents[row[this.grid.keyFieldName]] && this.detailGridViewComponents[row[this.grid.keyFieldName]].isExpanded)
				this.detailGridViewComponents[row[this.grid.keyFieldName]].expandCollapse();
		}
	}

	expandCollapse(keyFieldValue) {
		this.detailGridViewComponents[keyFieldValue].expandCollapse();
	}

	getSelectedKeys(): Array<any> {
		let selected = [];
		for (let k of Object.keys(this.selectedKeys)) {
			if (this.selectedKeys[k]) {
				selected.push(k);
			}
		}
		return selected;
	}

	private showRow(row: any): boolean {

		for (let col of this.grid.getDataColumns()) {
			if (!col.visible) continue;
			if (col.customFilter) {
				if (!col.customFilter(row))
					return false;
				continue;
			}
			if (col.filterMode != FilterMode.None && col.filterValue != null) {
				let itemVal = this.parserService.getObjectValue(col.fieldName, row);

				if (col instanceof SelectColumn) {
					const sc = <SelectColumn>col;
					if (sc.valueMember && sc.displayMember) {
						const opt = sc.selectOptions.find(o => o[sc.valueMember] == itemVal);
						if (opt) {
							itemVal = opt[col.displayMember];
						}
					}
					else if (col.displayMember) {
						const opt = col.selectOptions.find(o => o[sc.displayMember] == itemVal[sc.displayMember]);
						if (opt) {
							itemVal = opt[col.displayMember];
						}
					}
				}


				switch (col.filterMode) {
					case FilterMode.BeginsWith:
						if (!itemVal || itemVal.toLowerCase().indexOf(col.filterValue.toLowerCase()) != 0)
							return false;
						break;
					case FilterMode.Contains:
					case FilterMode.DistinctList:
					case FilterMode.DynamicList:
						if (col.filterValue instanceof Array) {
							if (col.filterValue.length > 0 && (!itemVal || col.filterValue.indexOf(itemVal) == -1)) {
								return false;
							}
						}
						else if (!itemVal || itemVal.toLowerCase().indexOf(col.filterValue.toLowerCase()) == -1)
							return false;
						break;
					case FilterMode.NotEqual:
						if (col.fieldType == FieldType.Date) {
							return new Date(itemVal).getTime() != new Date(col.filterValue).getTime();
						}
						if (!itemVal || itemVal == col.filterValue)
							return false;
						break;
					case FilterMode.Equals:
						if (col.fieldType == FieldType.Date) {
							return new Date(itemVal).getTime() == new Date(col.filterValue).getTime();
						}
						if (!itemVal || itemVal != col.filterValue)
							return false;
				}
			}
		}

		return true;
	}

	get displayData(): Array<any> {
		if (this._displayData == null && this.unpagedData != null) {
			if (this.grid.data && this.grid.data.length > 0 && this.grid.autoPopulateColumns && this.grid.columns.length < 1) {
				this.grid.populateColumns();
			}

			var rawData = this.unpagedData;
			if (this.grid.pageSize == 0 || this.grid.pagingType != PagingType.Auto) {
				// make copy as to not hinder original
				this._displayData = [];
				for (let d of rawData) {
					this._displayData.push(d);
				}
			}
			else
				this._displayData = rawData.slice((this.grid.currentPage - 1) * this.grid.pageSize, this.grid.currentPage * this.grid.pageSize);
		}

		return this._displayData || [];
	}

	private removeRowFromGrid(row: any) {
		for (let i = 0; i < this._displayData.length; i++) {
			if (this._displayData[i][this.grid.keyFieldName] == row[this.grid.keyFieldName]) {
				this._displayData.splice(i, 1);
				break;
			}
		}
		for (let i = 0; i < this.grid.data.length; i++) {
			if (this.grid.data[i][this.grid.keyFieldName] == row[this.grid.keyFieldName]) {
				this.grid.data.splice(i, 1);
				break;
			}
		}
	}

	addRow() {
		let args = new RowArguments();
		const row = {};
		if (this._grid.keyFieldName == TEMP_KEY_FIELD) {
			row[TEMP_KEY_FIELD] = Utils.newGuid();
		}
		args.grid = this.grid;
		args.rows = [row];
		this.grid.rowCreate.emit(args);
		if (!args.cancel) {
			this._displayData.splice(0, 0, row);
			this.grid.data.splice(0, 0, row);
			this.editingRows[row[this.grid.keyFieldName]] = row;
			this.newRows[row[this.grid.keyFieldName]] = row;
			this.changedRows[row[this.grid.keyFieldName]] = row;
			if (this.grid.detailGridView) {
				window.setTimeout(() => {
					let dgvc = this.detailGridViewComponents[row[this.grid.keyFieldName]];
					dgvc.expandCollapse();
				}, 100)

			}
		}
	}

	editRow(row: any) {
		let args = new RowArguments();
		args.rows = [row];
		args.grid = this.grid;

		if (this.grid.detailGridView) {
			let dgvc = this.detailGridViewComponents[row[this.grid.keyFieldName]];
			if (!dgvc.isExpanded)
				dgvc.expandCollapse();
			dgvc.gridViewComponent.editAll();
		}

		this.grid.rowEdit.emit(args);
		if (!args.cancel) {
			this.editingRows[row[this.grid.keyFieldName]] = {};
			Object.assign(this.editingRows[row[this.grid.keyFieldName]], row);
		}
	}

	editAll() {
		for (let row of this.displayData) {
			this.editRow(row);
		}
	}

	cancelAll() {
		for (let i = this.displayData.length - 1; i >= 0; i--) {
			const row = this.displayData[i];
			this.cancelEdit(row);
		}
	}

	cellValueChanged(args: CellArguments) {
		this.changedRows[args.row[this.grid.keyFieldName]] = Object.assign({}, args.row);
		this.grid.cellValueChanged.emit(args);
	}

	protected confirmDelete(row: any) {
		this.promptConfirm[row[this.grid.keyFieldName]] = true;
	}

	protected cancelDelete(row: any) {
		delete this.promptConfirm[row[this.grid.keyFieldName]];
	}

	private deleteSuccess(row: any) {
		this.removeRowFromGrid(row);
		delete this.editingRows[row[this.grid.keyFieldName]];
		delete this.changedRows[row[this.grid.keyFieldName]];
		delete this.newRows[row[this.grid.keyFieldName]];
		if (this.parentGridViewComponent) {
			this.deletedRows[row[this.grid.keyFieldName]] = row;
		}
		delete this.promptConfirm[row[this.grid.keyFieldName]];
	}

	deleteRow(row: any) {
		let args = new RowArguments();
		args.rows = [row];
		args.grid = this.grid;

		this.grid.rowDelete.emit(args);
		if (!args.cancel) {
			if (!args.observable)
				this.deleteSuccess(row);
			else {
				args.observable.subscribe(() => {
					this.deleteSuccess(row);
				});
			}
		}
	}

	validate(row: any): Array<DataColumn> {
		delete this.showRequired[(row[this.grid.keyFieldName])];
		let invalids = new Array<DataColumn>();
		for (let col of this.grid.getDataColumns()) {
			if (col.fieldName && col.required) {
				const val = this.parserService.getObjectValue(col.fieldName, row);
				if (val == null || val === undefined) {
					this.showRequired[(row[this.grid.keyFieldName])] = true;
					invalids.push(col);
				}
			}
		}

		let dgvc = this.detailGridViewComponents[row[this.grid.keyFieldName]];
		if (dgvc) {
			for (let drow of dgvc.detailGridViewInstance.data) {
				invalids = invalids.concat(dgvc.gridViewComponent.validate(drow));
			}
		}

		if (invalids.length > 0) {
			this.grid.rowInvalidated.emit(invalids);
		}
		return invalids;
	}

	saveAll() {
		let args = new RowArguments();
		args.grid = this.grid;
		args.rows = Object.keys(this.changedRows).map(r => this.changedRows[r]);
		args.deletedRows = Object.keys(this.deletedRows).map(r => this.deletedRows[r]);

		let valid = true;
		for (let row of args.rows) {
			if (this.validate(row).length > 0) valid = false;
		}

		if (!valid)
			return;

		// TODO:
		// if (this.grid.detailGridView) {
		// 	let dgvc = this.detailGridViewComponents[row[this.grid.keyFieldName]];
		// 	if (dgvc) {
		// 		for (let row of dgvc.detailGridViewInstance.data) {
		// 			dgvc.gridViewComponent.saveEdit(row);
		// 		}
		// 	}
		// }

		this.grid.rowSaveAll.emit(args);
		if (!args.cancel) {
			if (!args.observable) {
				this.changedRows = {};
				this.editingRows = {};
				this.newRows = {};
				this.deletedRows = {};
			}
			else {
				args.observable.subscribe(() => {
					this.changedRows = {};
					this.editingRows = {};
					this.newRows = {};
					this.deletedRows = {};
				});
			}
		}
	}

	saveEdit(row: any) {
		if (this.validate(row).length > 0) return false;

		if (this.grid.detailGridView) {
			let dgvc = this.detailGridViewComponents[row[this.grid.keyFieldName]];
			if (dgvc && dgvc.detailGridViewInstance.data.length > 0) {
				// for (let row of dgvc.detailGridViewInstance.data) {
				// 	dgvc.gridViewComponent.saveEdit(row);
				// }
				dgvc.gridViewComponent.saveAll();
			}
		}

		let args = new RowArguments();
		args.rows = [row];
		args.grid = this.grid;

		this.grid.rowSave.emit(args);
		if (!args.cancel) {
			if (!args.observable) {
				delete this.editingRows[row[this.grid.keyFieldName]];
				delete this.changedRows[row[this.grid.keyFieldName]];
				delete this.newRows[row[this.grid.keyFieldName]];
				delete this.deletedRows[row[this.grid.keyFieldName]];
			}
			else {
				args.observable.subscribe(() => {
					delete this.editingRows[row[this.grid.keyFieldName]];
					delete this.changedRows[row[this.grid.keyFieldName]];
					delete this.newRows[row[this.grid.keyFieldName]];
					delete this.deletedRows[row[this.grid.keyFieldName]];
				});
			}
		}
	}

	cancelEdit(row: any) {
		if (this.grid.detailGridView) {
			let dgvc = this.detailGridViewComponents[row[this.grid.keyFieldName]];
			if (dgvc && dgvc.detailGridViewInstance.data) {
				for (let i = dgvc.detailGridViewInstance.data.length - 1; i >= 0; i--) {
					const row2 = dgvc.detailGridViewInstance.data[i];
					dgvc.gridViewComponent.cancelEdit(row2);
				}
				for (let k of Object.keys(dgvc.gridViewComponent.deletedRows)) {
					const deleted = dgvc.gridViewComponent.deletedRows[k];
					const existing = dgvc.detailGridViewInstance.data.find(d =>
						d[dgvc.detailGridViewInstance.keyFieldName] == deleted[dgvc.detailGridViewInstance.keyFieldName]);
					if (!existing) {
						dgvc.detailGridViewInstance.data.push(deleted);
					}
				}
				dgvc.gridViewComponent.deletedRows = {};
				dgvc.gridViewComponent.resetDisplayData();
			}
		}

		if (this.newRows[row[this.grid.keyFieldName]]) {
			this.removeRowFromGrid(row);
			delete this.newRows[row[this.grid.keyFieldName]];
		}
		else
			Object.assign(row, this.editingRows[row[this.grid.keyFieldName]]);

		delete this.editingRows[row[this.grid.keyFieldName]];
		delete this.changedRows[row[this.grid.keyFieldName]];
		delete this.deletedRows[row[this.grid.keyFieldName]];
	}

	refreshDataSource() {
		this._displayData = null;
		this._unpagedData = null;
	}

	resetDisplayData() {
		this._displayData = null;
	}

	handlePageChanging() {
		if (this.detailGridViewComponents)
			this.collapseAll();
	}

	handlePageChanged(pageNumber: any) {
		if (this.pageChanged)
			this.pageChanged.emit(pageNumber);
		if (this.grid.saveGridStateToStorage)
			this.grid.saveGridState();
		window.setTimeout(() => this.updateDimensions(), 100);
	}
}