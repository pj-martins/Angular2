﻿import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { Event, Customer } from './classes';
import { RoomComponent } from './room.component';
import { TreeViewNode } from '../../lib/treeview/treeview';
import { TreeViewComponent } from '../../lib/treeview/treeview.component';
import { RoomNodeTemplateComponent } from './treeview-templates.component';
import { Observable } from 'rxjs';

import moment from 'moment-es6';
import { DataService } from '../../lib';


@Component({
	selector: 'demo-tree',
	template: `
<treeview [nodes]='nodes'></treeview>
<br /><br />
<button (click)='treeViewComponent.expandAll()'>Expand All</button>
<button (click)='treeViewComponent.collapseAll()'>Collapse All</button>
`
})
export class DemoTreeComponent implements OnInit {
	nodes: Array<TreeViewNode>;

	@ViewChild(TreeViewComponent)
	treeViewComponent: TreeViewComponent;

	constructor(private dataService: DataService) {

	}

	async ngOnInit() {
		let events = (await this.dataService.getItems<any>('/assets/events.json').toPromise()).data;

		this.nodes = new Array<TreeViewNode>();
		for (let i = 0; i < events.length; i++) {
			let e = events[i];

			let node: TreeViewNode;
			for (let curr of this.nodes) {
				if (curr.text == e.customer.customerName) {
					node = curr;
					break;
				}
			}

			if (node == null) {
				node = new TreeViewNode();
				node.dataItem = e;
				node.text = e.customer.customerName;
				node.childNodes = new Array<TreeViewNode>();
				this.nodes.push(node);
			}

			let eventNode = new TreeViewNode();
			eventNode.dataItem = e;
			eventNode.class = "event-node";
			eventNode.text = moment(e.eventStartDT).format("MM/DD/YYYY") + " - " + moment(e.eventEndDT).format("MM/DD/YYYY") + " " + e.requestedBy;

			// synchronous
			if (i < 5) {
				eventNode.childNodes = new Array<TreeViewNode>();
				for (let r of e.hallRequestRooms) {
					let childNode = new TreeViewNode();
					childNode.dataItem = r;
					childNode.text = r.hallRoom.roomName;
					childNode.template = RoomNodeTemplateComponent;
					eventNode.childNodes.push(childNode);
				}
			}
			// asynchronous
			else if (i < 10) {
				eventNode.getChildNodes = (parent: any) => {
					let e = <Event>parent;
					let childNodes = new Array<TreeViewNode>();
					for (let r of e.hallRequestRooms) {
						let childNode = new TreeViewNode();
						childNode.dataItem = r;
						childNode.text = r.hallRoom.roomName;
						childNode.template = RoomNodeTemplateComponent;
						childNodes.push(childNode);
					}

					return Observable.create(o => o.next(childNodes));
				}
			}

			node.childNodes.push(eventNode);
		}
	}
}