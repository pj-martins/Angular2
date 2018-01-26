import { EventEmitter, Type, PipeTransform } from '@angular/core';
import { FieldType, FilterMode } from './gridview-enums';
import { Utils, SortDirection } from '../shared';
import { IGridViewCellTemplateComponent, IGridViewFilterCellTemplateComponent } from './gridview-interfaces';

export class ColumnBase {
	visible: boolean = true;
	width: string;
	name: string;
	columnIndex: number = 0;
	allowSizing: boolean;
	getRowCellClass: (row: any) => string;
	dataChanged = new EventEmitter<any[]>();
	customProps: { [name: string]: any; } = {};

	constructor(public caption?: string) { }

	getIdentifier(): string {
		if (!this.name)
			this.name = Utils.newGuid();
		return this.name;
	}
}
export class DataColumn extends ColumnBase {
	fieldType: FieldType = FieldType.String;
	columnPipe: ColumnPipe;
	sortIndex: number = 0;
	filterValue: any;
	format: string;
	sortable: boolean;
	disableWrapping: boolean;
	filterMode: FilterMode = FilterMode.None;
	template: Type<IGridViewCellTemplateComponent>;
	editTemplate: Type<IGridViewCellTemplateComponent>;
	templateInit = new EventEmitter<IGridViewCellTemplateComponent>();
	filterTemplate: Type<IGridViewFilterCellTemplateComponent>;
	filterDelayMilliseconds = 0;
	sortDirection: SortDirection = SortDirection.None;
	customSort: (obj1: any, obj2: any) => number;
	customFilter: (obj: any) => boolean;
	required = false;
	readonly: boolean;

	private _filterOptions: any[];
	get filterOptions(): any[] {
		return this._filterOptions;
	}

	set filterOptions(v: any[]) {
		this._filterOptions = v;
		this.filterOptionsChanged.emit(v);
	}

	filterOptionsChanged: EventEmitter<any> = new EventEmitter<any>();

	constructor(public fieldName?: string, public caption?: string) {
		super(caption);
		this.dataChanged.subscribe((d: any[]) => {

		});
	}

	getCaption(): string {
		if (this.caption) return this.caption;
		let parsedFieldName = this.fieldName;
		if (!parsedFieldName || parsedFieldName == '') return '';
		if (parsedFieldName.lastIndexOf('.') > 0) {
			parsedFieldName = parsedFieldName.substring(parsedFieldName.lastIndexOf('.') + 1, parsedFieldName.length);
		}
		return parsedFieldName.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
			return str.toUpperCase();
		});
	}

	getIdentifier(): string {
		if (this.name) return this.name;
		if (this.fieldName) return this.fieldName;
		return this.caption;
	}
}
export class NumericColumn extends DataColumn {
	decimalPlaces = 0;
}
export class ButtonColumn extends DataColumn {
	click = new EventEmitter<any>();
	text: string;
	class: string;
	constructor(public fieldName?: string, public caption?: string) {
		super(fieldName, caption);
	}
}
export class ColumnPipe {
	constructor(public pipe: PipeTransform, public args?: any) { }
}
