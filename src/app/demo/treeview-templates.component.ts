import { Component, OnInit } from '@angular/core';
import { TreeViewNodeTemplateComponent } from '../../lib/treeview/treeview-node-template.component';

@Component({
	selector: 'room-node-template',
	template: `
<strong>{{node.text}}</strong> - (ID: <a href='javascript:void(0)' (click)='processID()'>{{node.dataItem.id}}</a>)
`
})
export class RoomNodeTemplateComponent extends TreeViewNodeTemplateComponent {
	processID() {
		alert(this.node.dataItem.id);
	}
}