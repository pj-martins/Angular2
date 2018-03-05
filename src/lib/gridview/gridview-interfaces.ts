import { DataColumn } from "./gridview-columns";
import { GridView, DetailGridView, TEMP_KEY_FIELD } from "./gridview";

export interface IGridViewFilterCellTemplateComponent {
	column: DataColumn;
	parentGridView: GridView;
	parentFilterCellComponent: IGridViewFilterCellComponent;
}

export interface IGridViewCellTemplateComponent {
	row: any;
	column: DataColumn;
	parentGridView: GridView;
	parentGridViewComponent: IGridViewComponent;
}

export interface IGridViewRowTemplateComponent {
	parentGridView: GridView;
	row: any;
	parentGridViewComponent: IGridViewComponent;
}

export interface IGridViewComponent {
	unpagedData: Array<any>;
	displayData: Array<any>;
	resetDisplayData();
	grid: GridView;
	newRows: { [tempKeyValue: string]: any };
	changedRows: { [tempKeyValue: string]: any };
	editingRows: { [tempKeyValue: string]: any };
	deletedRows: { [tempKeyValue: string]: any };
	editRow(row: any);
	detailGridViewComponents: { [tempKeyValue: string]: IDetailGridViewComponent };
	saveEdit(row: any);
	saveAll();
	cancelEdit(row: any);
	validate(row: any);
	editAll();
	addRow();
}

export interface IDetailGridViewComponent {
	isExpanded: boolean;
	expandCollapse(): void;
	detailGridViewInstance: DetailGridView;
	gridViewComponent: IGridViewComponent;
	parentGridViewComponent: IGridViewComponent;
}

export interface IGridViewFilterCellComponent {
	filterChanged(): void;
}