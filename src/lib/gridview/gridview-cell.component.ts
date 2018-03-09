import { Component, Input } from '@angular/core';
import { GridView } from './gridview';
import { DataColumn, SelectColumn } from './gridview-columns';
import { FieldType } from './gridview-enums';
import { GridViewComponent } from './gridview.component';
import { PipesModule } from '../pipes';
import { ParserService } from '../services/parser.service';

@Component({
	selector: 'gridview-cell',
	styleUrls: ['gridview.css'],
	template: `
<div *ngIf="!editing && column.template && !column.render">
	<div [gridviewCellTemplate]="column.template" [column]="column" [row]="row" [parentGridViewComponent]="parentGridViewComponent" [parentGridView]="parentGridView"></div>
</div>
<div *ngIf="!editing && column.render">
	<div>{{column.render(row)}}</div>
</div>
<div *ngIf="!column.template && !column.render && (!editing || !column.editTemplate)">
	<div *ngIf="column.fieldType == fieldType.Date">
		<div *ngIf="!editing || column.readonly" 
				[innerHTML]="getObjectValue() == null ? '' : getObjectValue() | moment:(column.format ? column.format : 'MM/DD/YYYY')"></div>
		<input type="text" dateTimePicker [hideTime]="true" style="width:100%" *ngIf="(parentGridView.allowEdit || parentGridView.allowAdd) && !column.readonly && editing" [(ngModel)]="row[column.fieldName]" (ngModelChange)="parentGridViewComponent.cellValueChanged(self)" />
		<div class="error-label" *ngIf="!row[column.fieldName] && column.required && showRequired">{{column.getCaption()}} is required!</div>
	</div>
	<div *ngIf="column.fieldType == fieldType.Time">
		<div *ngIf="!editing || column.readonly" 
				[innerHTML]="getObjectValue() == null ? '' : getObjectValue() | moment:(column.format ? column.format : 'LT')"></div>
		<input type="text" dateTimePicker [hideDate]="true" style="width:100%" *ngIf="!column.readonly &&  editing" [(ngModel)]="row[column.fieldName]" (ngModelChange)="parentGridViewComponent.cellValueChanged(self)" />
		<div class="error-label" *ngIf="!row[column.fieldName] && column.required && showRequired">{{column.getCaption()}} is required!</div>
	</div>
	<div *ngIf="!column.format && column.fieldType == fieldType.Boolean">
		<div *ngIf="!editing || column.readonly" [ngClass]="{ 'icon-small icon-check-black' : getObjectValue(false) == true }"></div>
		<input type="checkbox" *ngIf="!column.readonly && editing" [(ngModel)]="row[column.fieldName]" (ngModelChange)="parentGridViewComponent.cellValueChanged(self)" />
	</div>
	<div *ngIf="column.click">
		<button class="{{column.class}}" (click)="column.click.emit(row)">{{column.text || getObjectValue('')}}</button>
	</div>
	<!-- TODO: should we allow links to above items? duplication here too -->
	<div *ngIf="column.fieldType != fieldType.Date && column.fieldType != fieldType.Time && column.fieldType != fieldType.Boolean && !column.format && !column.click">
		<div *ngIf="(!editing || column.readonly) && !column.render" [innerHTML]="getObjectValue('')"></div>
		<div *ngIf="editing && !column.readonly" style="width:100%">
			<input type="text" style="width:100%" *ngIf="column.fieldType != fieldType.Numeric && !column.rows && !column.selectOptions" [(ngModel)]="row[column.fieldName]" (ngModelChange)="parentGridViewComponent.cellValueChanged(self)" />
			<textarea style="width:100%" rows="{{column.rows}}" *ngIf="column.rows" [(ngModel)]="row[column.fieldName]" (ngModelChange)="parentGridViewComponent.cellValueChanged(self)"></textarea>
			<select style="width:100%" [compareWith]="compareSelectOption" [(ngModel)]="row[column.fieldName]" (ngModelChange)="parentGridViewComponent.cellValueChanged(self)" *ngIf="column.selectOptions">
				<option *ngIf="column.addBlank" [ngValue]="null"></option>
				<option *ngFor="let o of column.selectOptions" [ngValue]="column.valueMember ? o[column.valueMember] : o">
					{{column.displayMember ? o[column.displayMember] : o}}
				</option>
			</select>
			<input type="number" style="width:100%" *ngIf="column.fieldType == fieldType.Numeric" [(ngModel)]="row[column.fieldName]" (ngModelChange)="parentGridViewComponent.cellValueChanged(self)" />
		</div>
		<div class="error-label" *ngIf="!row[column.fieldName] && column.required && showRequired">{{column.caption}} is required!</div>
	</div>
</div>
<div *ngIf="editing && column.editTemplate">
	<div [gridviewCellTemplate]="column.editTemplate" [column]="column" [row]="row" [parentGridViewComponent]="parentGridViewComponent" [parentGridView]="parentGridView"></div>
</div>
`
})
export class GridViewCellComponent {
	@Input() column: DataColumn;
	@Input() row: any;

	@Input() parentGridViewComponent: GridViewComponent;
	@Input() parentGridView: GridView;
	@Input() first: boolean;
	@Input() last: boolean;

	@Input() index: number;

	protected self = this;

	protected fieldType = FieldType;

	get editing(): boolean {
		return this.parentGridViewComponent.editingRows[this.row[this.parentGridViewComponent.grid.keyFieldName]];
	}

	protected get showRequired(): boolean {
		return this.parentGridViewComponent.showRequired[this.row[this.parentGridViewComponent.grid.keyFieldName]];
	}

	constructor(protected parserService: ParserService) { }

	protected getObjectValue(def: any = null) {
		let val = this.parserService.getObjectValue(this.column.fieldName, this.row);
		if (val == null) return def;
		if (this.column.columnPipe) {
			val = this.column.columnPipe.pipe.transform(val, this.column.columnPipe.args);
		}
		else if (this.column instanceof SelectColumn) {
			const col = <SelectColumn>this.column;
			if (col.valueMember) {
				const opt = col.selectOptions.find(o => o[col.valueMember] == val);
				if (opt) {
					return col.displayMember ? opt[col.displayMember] : opt;
				}
			}
			else if (col.displayMember) {
				const opt = col.selectOptions.find(o => o[col.displayMember] == val[col.displayMember]);
				if (opt) {
					return opt[col.displayMember];
				}
			}

			// option not found
			if (col.valueMember && col.displayMember && col.parentField) {
				if (this.row[col.parentField] && this.row[col.parentField][col.valueMember] == val) {
					return this.row[col.parentField][col.displayMember];
				}
			}
		}
		return val;
	}

	compareSelectOption = (a, b) => {
		const col = <SelectColumn>this.column;
		if (!col.valueMember && col.displayMember) {
			return (a && b && a[col.displayMember] == b[col.displayMember]);
		}
		return a == b;
	}
}