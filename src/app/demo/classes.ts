export class Customer {
	customerName: string;
	id: number;
}

export class HallRequestRoom {
	hallRoom: Room;
	isPrimaryChoice: boolean;
	hallRoomId: number;
}

export class Event {
	customer: Customer;
	customerId: number;
	hallRequestRooms: Array<HallRequestRoom> = [];
	hallEventType: EventType;
	eventStartDT: Date;
	eventEndDT: Date;
	requestedBy: string;
	cancelled: boolean;
}

export class EventType {
	eventTypeName: string;
	id: number;
}

export class Room {
	id: number;
	roomName: string;
}