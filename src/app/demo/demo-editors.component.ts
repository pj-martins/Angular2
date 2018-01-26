import { Component } from '@angular/core';
import { Room } from './classes';
import { Observable } from 'rxjs/Rx';

declare var ROOMS: Array<Room>;

@Component({
	selector: 'demo-editors',
	templateUrl: './demo-editors.component.html'
})
export class DemoEditorsComponent {
	selectedDateTime: Date;
	hideDate: boolean;
	hideTime: boolean;
	selectOnCalendarClick: boolean;
	minDate: Date;
	maxDate: Date;
	minuteStep: number;

	selectedText: string;
	multiTextboxItems: Array<string> = ['Item 1', 'Item 2'];
	multiTypeaheadItems: Array<string> = [];
	dataSource: Array<string> = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Tango', 'Zulu'];

	selectedRoomIDs: Array<number> = [];
	selectedRooms: Array<Room> = [];
	selectedRoomID: number;
	selectedRoom: Room;
	selectedRoom2: Room;
	selectedRoom3: Room;
	
	rooms = ROOMS;
	getRooms = (partial: string): Array<any> => {
		let rooms = [];
		for (let r of this.rooms) {
			if (r.roomName.toLowerCase().indexOf(partial.toLowerCase()) >= 0) {
				rooms.push(r);
			}
		}
		return rooms;
	}

	getRoomsObservable = (partial: string): Observable<Array<any>> => {
		let rooms = this.getRooms(partial);
		return Observable.create(o => o.next(rooms));
	}
}