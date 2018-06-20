import { Component, OnInit } from '@angular/core';
import { Room } from './classes';
import { Observable } from 'rxjs';
import { DataService } from '../../lib';
import moment from 'moment-timezone-es6';

@Component({
	selector: 'demo-editors',
	templateUrl: './demo-editors.component.html'
})
export class DemoEditorsComponent implements OnInit {
	selectedDateTime: Date;
	timeZone: any = "2018-01-01";
	hideDate: boolean;
	hideTime: boolean;
	selectOnCalendarClick: boolean;
	minDate: Date;
	maxDate: Date;
	minuteStep: number;

	selectedText: string;
	youSelected: string;
	multiTextboxItems: Array<string> = ['Item 1', 'Item 2'];
	multiTypeaheadItems: Array<string> = [];
	dataSource: Array<string> = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Tango', 'Zulu'];

	selectedRoomIDs: Array<number> = [];
	selectedRooms: Array<Room> = [];
	selectedRoomID: number;
	selectedRoom: Room;
	selectedRoom2: Room;
	selectedRoom3: Room;

	rooms: Array<any> = [];

	constructor(private dataService: DataService) {
		
	}

	async ngOnInit() {
		this.rooms = (await this.dataService.getItems('/assets/rooms.json').toPromise()).data;
	}
	
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

	roomSelected(room: Room) {
		this.youSelected = room.roomName;
	}

	prevDate() {
		let dt = new Date(this.selectedDateTime);
		dt.setDate(dt.getDate() - 1);
		this.selectedDateTime = dt;
	}

	nextDate() {
		this.selectedDateTime.setDate(this.selectedDateTime.getDate() + 1);
	}

	get timeZoneFormatted() {
		return moment(this.timeZone, moment.ISO_8601).format("L");
	}
}