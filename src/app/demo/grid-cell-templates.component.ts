import { Component, OnInit } from '@angular/core';
import { GridView, DataColumn, FilterMode, FieldType } from '../../lib/gridview/gridview';
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

declare var EVENTS: Array<Event>;

@Component({
	selector: 'customer-cell-edit',
	template: `
<input type="text" [(ngModel)]='row.customer' typeahead [dataSource]='customers' displayMember='customerName' />
`
})
export class CustomerCellEditTemplateComponent extends GridViewCellTemplateComponent {
	customers = new Array<Customer>();
	constructor() {
		super();
		for (let e of EVENTS) {
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