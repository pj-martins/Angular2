﻿import { GridView } from './gridview';
import { DataColumn } from './gridview-columns';
import { IGridViewFilterCellComponent, IGridViewFilterCellTemplateComponent, IGridViewComponent, IGridViewCellTemplateComponent, IGridViewRowTemplateComponent } from './gridview-interfaces';

export abstract class GridViewFilterCellTemplateComponent implements IGridViewFilterCellTemplateComponent {
	column: DataColumn;
	parentGridView: GridView;
	parentFilterCellComponent: IGridViewFilterCellComponent;
}

export abstract class GridViewCellTemplateComponent implements IGridViewCellTemplateComponent {
	column: DataColumn;
	parentGridView: GridView;
	parentGridViewComponent: IGridViewComponent;
	row: any;
}

export abstract class GridViewRowTemplateComponent implements IGridViewRowTemplateComponent {
	parentGridView: GridView;
	row: any;
	parentGridViewComponent: IGridViewComponent;
}