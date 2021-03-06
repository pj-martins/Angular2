﻿import { Component, OnInit, Input } from '@angular/core';
import { GridView } from '../../lib/gridview/gridview';
import { DataColumn } from '../../lib/gridview/gridview-columns';
import { FilterMode, FieldType } from '../../lib/gridview/gridview-enums';
import { GridViewCellTemplateComponent, GridViewFilterCellTemplateComponent } from '../../lib/gridview/gridview-templates.component';
import { Event, Customer } from './classes';

@Component({
	selector: 'coordinator-filter-cell',
	template: `
<input typeahead [(ngModel)]='column.filterValue' [dataSource]='column.customProps.coordinators'
	(itemSelected)="parentFilterCellComponent.filterChanged()"
    (ngModelChange)="parentFilterCellComponent.filterChanged()" />
`
})
export class CoordinatorFilterCellTemplateComponent extends GridViewFilterCellTemplateComponent { }

@Component({
	selector: 'event-type-filter-cell',
	template: `
<input type="text" [multiTextbox]="column.filterValue" style="width:40%" (itemsChanged)="parentFilterCellComponent.filterChanged()" />
`
})
export class EventTypeFilterCellTemplateComponent extends GridViewFilterCellTemplateComponent { }

@Component({
	selector: 'requested-by-filter-cell',
	template: `
<input [multiTypeahead]='column.filterValue' (itemsChanged)="parentFilterCellComponent.filterChanged()" [dataSource]='column.filterOptions' />
`
})
export class RequestedByFilterCellTemplateComponent extends GridViewFilterCellTemplateComponent { }

@Component({
	selector: 'customer-cell',
	template: `
<strong>{{row.customer?.customerName}}</strong>
`
})
export class CustomerCellTemplateComponent extends GridViewCellTemplateComponent { }

@Component({
	selector: 'customer-cell-edit',
	template: `
<input type="text" [(ngModel)]='row.customer' typeahead [dataSource]='customers' displayMember='customerName' />
`
})
export class CustomerCellEditTemplateComponent extends GridViewCellTemplateComponent {
	@Input()
	events: Array<any>;

	customers = new Array<Customer>();
	constructor() {
		super();
		for (let e of this.events) {
			if (e.customer) {
				let exists = false;
				for (let c of this.customers) {
					if (e.customer.id == c.id) {
						exists = true;
						break;
					}
				}
				if (!exists)
					this.customers.push(e.customer);
			}
		}
	}
}