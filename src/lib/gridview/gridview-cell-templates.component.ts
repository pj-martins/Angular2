import { Component, Input } from '@angular/core';
import { GridViewComponent } from './gridview.component';
import { GridView } from './gridview';
import { DataColumn } from './gridview-columns';
import { IGridViewCellTemplateComponent } from './gridview-interfaces';

@Component({
	selector: 'gridview-textarea-cell',
	styleUrls: ['gridview.css'],
	template: `
<textarea style="width:100%" rows="5" [(ngModel)]="row[column.fieldName]" (ngModelChange)="parentGridView.cellValueChanged.emit(self)"></textarea>
`
})
export class GridViewTextAreaCellComponent implements IGridViewCellTemplateComponent {
	@Input() column: DataColumn;
	@Input() row: any;
	@Input() parentGridViewComponent: GridViewComponent;
	@Input() parentGridView: GridView;

	self = this;
}