import { DataColumn } from "./gridview-columns";
import { GridView, DetailGridView } from "./gridview";

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
	editingRows: { [tempKeyValue: string]: any };
	editRow(row: any);
	detailGridViewComponents: { [tempKeyValue: string]: IDetailGridViewComponent };
	saveEdit(row: any);
	cancelEdit(row: any);
}

export interface IDetailGridViewComponent {
	isExpanded: boolean;
	expandCollapse(): void;
	detailGridViewInstance: DetailGridView;
	gridViewComponent: IGridViewComponent;
}

export interface IGridViewFilterCellComponent {
	filterChanged(): void;
}