import { Component } from '@angular/core';
import { Room } from './classes';
import { GridViewRowTemplateComponent } from '../../lib/gridview/gridview-templates.component'

@Component({
	selector: 'room',
	templateUrl: './room.component.html'
})
export class RoomComponent extends GridViewRowTemplateComponent {
	
}