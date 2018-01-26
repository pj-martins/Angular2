import { Component, Input } from '@angular/core';
import { GridView } from './gridview';
import { DataColumn } from './gridview-columns';
import { IGridViewFilterCellTemplateComponent, IGridViewFilterCellComponent } from './gridview-interfaces';
import { FieldType } from './gridview-enums';

// could be reusable
@Component({
	selector: 'datefilter',
	styleUrls: ['../assets/css/styles.css', '../assets/css/icons.css', '../assets/css/buttons.css', 'gridview-datefilter.css'],
	template: `
<div class='date-filter-picker'>
	<div class='date-filter-from'>
		<input type="text" style='width:100%' dateTimePicker [hideTime]="true" placeholder="From" [(ngModel)]='fromDate' (ngModelChange)='filterChanged()' [selectOnCalendarClick]="true" />
	</div>
	<div class='date-filter-to'>
		<input type="text" style='width:100%' dateTimePicker [hideTime]="true" placeholder="To" [(ngModel)]='toDate' (ngModelChange)='filterChanged()' [selectOnCalendarClick]="true" />
	</div>
</div>
`
})
export class DateFilterComponent implements IGridViewFilterCellTemplateComponent {

	private _column: DataColumn;
	@Input()
	get column(): DataColumn {
		return this._column;
	}
	set column(c: DataColumn) {
		this._column = c;
		if (c.fieldType != FieldType.Date) {
			throw "Date Range filter can only be applied to columns of type Date";
		}
		//if (!c.filterValue) {
		//	c.filterValue = {};
		//}
		c.customFilter = (obj) => { return this.customFilter(obj) };
	}

	get fromDate(): Date {
		return this.column && this.column.filterValue ? this.column.filterValue.fromDate : null;
	}
	set fromDate(d: Date) {
		if (!this.column) return;
		if (!this.column.filterValue)
			this.column.filterValue = {};
		this.column.filterValue.fromDate = d;
	}

	get toDate(): Date {
		return this.column && this.column.filterValue ? this.column.filterValue.toDate : null;
	}
	set toDate(d: Date) {
		if (!this.column) return;
		if (!this.column.filterValue)
			this.column.filterValue = {};
		this.column.filterValue.toDate = d;
	}

	@Input()
	parentGridView: GridView;

	@Input()
	parentFilterCellComponent: IGridViewFilterCellComponent;

	private customFilter(obj: any): boolean {
		if (this.column.filterValue && this.column.filterValue.fromDate) {
			if (!obj[this._column.fieldName])
				return false;
			if (new Date(obj[this._column.fieldName]) < new Date(this.column.filterValue.fromDate))
				return false;
		}

		if (this.column.filterValue && this.column.filterValue.toDate) {
			if (!obj[this._column.fieldName])
				return false;
			if (new Date(obj[this._column.fieldName]) > new Date(this.column.filterValue.toDate))
				return false;
		}

		return true;
	}

	filterChanged() {
		this.parentFilterCellComponent.filterChanged();
	}
}