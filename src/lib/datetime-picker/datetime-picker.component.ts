import { Component, Input, Output, EventEmitter, OnInit, forwardRef, NgZone, Directive, Attribute, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, AbstractControl, NG_VALIDATORS, Validator, FormControl } from '@angular/forms';
import newGuid from '../utils/newGuid';
import moment from 'moment-timezone-es6';
@Component({
	selector: 'datetime-picker',
	template: `
<div class='datetime-picker'>
	<div class="input-button-container component id_{{uniqueId}}">
		<button class="input-button datetime-picker-button id_{{uniqueId}}" (click)="showDropdown()" tabindex="-1">
			<div class="icon-calendar-black icon-x-small id_{{uniqueId}}"></div>
		</button>
	</div>
	<div class="datetime-picker-dropdown component {{hideDate ? 'datetime-picker-timeonly-dropdown' : ''}} id_{{uniqueId}}" *ngIf="dropdownVisible">
		<div class="datetime-picker-container id_{{uniqueId}}">
			<div class="datetime-picker-controls-panel" *ngIf="!hideDate">
				<div class="datetime-picker-date-panel id_{{uniqueId}}">
					<select [(ngModel)]="selectedMonth" (change)="refreshCalendarDates()">
						<option *ngFor="let mo of months" [ngValue]="mo.number" class="month-option id_{{uniqueId}}">{{mo.name.substring(0, 3)}}</option>
					</select>
					<input type="number" [(ngModel)]="selectedYear" (change)="refreshCalendarDates()" />
					<div class="arrow-up-down-container">
						<div class="datetime-picker-top-spinner datetime-picker-clickable icon-arrow-up-black spinner-arrows" (click)="addYear(false)">
						</div>
						<div class="datetime-picker-bottom-spinner datetime-picker-clickable icon-arrow-down-black spinner-arrows" (click)="addYear(true)">
						</div>
					</div>
					<div class="arrow-left-right-container">
						<div class="icon-arrow-left-black icon-x-small datetime-picker-month-spinner datetime-picker-clickable" (click)="addMonth(true)"></div>
						<div class="icon-arrow-right-black icon-x-small datetime-picker-month-spinner datetime-picker-clickable" (click)="addMonth(false)"></div>
					</div>
				</div>
			</div>
			<div class="datetime-picker-inner" *ngIf="!hideDate">
				<table class="datetime-picker-calendar-table id_{{uniqueId}}" cellspacing=0>
					<tr class="datetime-picker-calendar-header-row">
						<td *ngFor="let day of dayNames" class="datetime-picker-calendar-header">
							{{day.substring(0, 2)}}
						</td>
					</tr>
					<tr *ngFor="let weekNumber of weekNumbers">
						<td *ngFor="let date of calendarDates[weekNumber]" [ngClass]="'datetime-picker-calendar-day ' + ((!minDate || date.toDate() >= minDate) && (!maxDate || date.toDate() <= maxDate) ? 'datetime-picker-clickable ' : 'datetime-picker-disabled ') + (datesAreEqual(date) ? 'datetime-picker-selected' : '')"
								(click)="selectDate(date)">
							{{date.format("D")}}
						</td>
					</tr>
				</table>
			</div>
			<div class="datetime-picker-controls-panel" *ngIf="!hideTime">
				<div class="datetime-picker-time-panel id_{{uniqueId}}">
					<input type="text" [(ngModel)]="selectedHour" (blur)="formatHour()" />
					<div class="arrow-up-down-container">
						<div class="datetime-picker-top-spinner datetime-picker-clickable icon-arrow-up-black spinner-arrows" (click)="addHour(false)">
						</div>
						<div class="datetime-picker-bottom-spinner datetime-picker-clickable icon-arrow-down-black spinner-arrows" (click)="addHour(true)">
						</div>
					</div>
					<input type="text" [(ngModel)]="selectedMinute" (blur)="formatMinute()" />
					<div class="arrow-up-down-container">
						<div class="datetime-picker-top-spinner datetime-picker-clickable icon-arrow-up-black spinner-arrows" (click)="addMinute(false)">
						</div>
						<div class="datetime-picker-bottom-spinner datetime-picker-clickable icon-arrow-down-black spinner-arrows" (click)="addMinute(true)">
						</div>
					</div>
					<select [(ngModel)]="selectedAMPM">
						<option class="ampm-option id_{{uniqueId}}" [ngValue]="'AM'">AM</option>
						<option class="ampm-option id_{{uniqueId}}" [ngValue]="'PM'">PM</option>
					</select>
				</div>
			</div>
			<div class="datetime-picker-controls-panel">
				<div class="datetime-picker-buttons-panel id_{{uniqueId}}">
					<button class="btn btn-small btn-primary" (click)="selectNow()">
						Now
					</button>
					&nbsp;
					<button class="btn btn-small btn-primary" (click)="persistDate()">
						Select
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
`,
	styleUrls: ['../assets/css/styles.css', '../assets/css/icons.css', '../assets/css/buttons.css', 'datetime-picker.css']
})
export class DateTimePickerComponent implements OnInit { // implements ControlValueAccessor, OnInit {
	@Input() hideDate: boolean;
	@Input() hideTime: boolean;
	selectOnCalendarClick: boolean;
	minDate: Date;
	maxDate: Date;
	minuteStep: number;
	uniqueId = newGuid();
	dropdownVisible: boolean = false;
	timezone: string;
	
	dateChanged = new EventEmitter<Date>();
	private _lock = false;
	private _innerValue: any;
	private get innerValue(): Date {
		return this._innerValue ? this._innerValue.toDate() : null;
	}
	private set innerValue(v: Date) {
		this._innerValue = v == null ? null : this.getMoment(v.toLocaleDateString());
		if (!this._lock)
			this.dateChanged.emit(v);
	}
	private selectedDate: any;
	private currentonclick: any;
	dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	weekNumbers = [0, 1, 2, 3, 4, 5];
	months = [
		{ number: 1, name: "January" },
		{ number: 2, name: "February" },
		{ number: 3, name: "March" },
		{ number: 4, name: "April" },
		{ number: 5, name: "May" },
		{ number: 6, name: "June" },
		{ number: 7, name: "July" },
		{ number: 8, name: "August" },
		{ number: 9, name: "September" },
		{ number: 10, name: "October" },
		{ number: 11, name: "November" },
		{ number: 12, name: "December" }
	];
	calendarDates: Array<Array<any>>;
	selectedMonth: number;
	selectedYear: number;
	selectedHour: string;
	selectedMinute: string;
	selectedAMPM: string;
	constructor(private zone: NgZone, public elementRef: ElementRef) { }
	ngOnInit() {
		// TODO: hackish, need to find a better way to hide drop down when they click off of it, can't use blur
		// since blur will fire when the dropdown div is clicked in which case we don't want to hide the dropdown
		let self = this;
		this.currentonclick = document.onclick;
		document.onclick = (event: any) => {
			if (this.currentonclick) this.currentonclick(event);
			if (self.dropdownVisible && event.target) {
				let isInPicker = false;
				let curr = 3;
				let el = event.target;
				while (curr-- > 0 && el != null) {
					if (el.className && el.className.indexOf(`id_${this.uniqueId}`) >= 0) {
						isInPicker = true;
						break;
					}
					el = el.offsetParent;
				}
				if (!isInPicker)
					self.zone.run(() => self.dropdownVisible = false);
			}
		};
	}
	private getMinuteInt() {
		let currMinute = parseInt(this.selectedMinute);
		if (isNaN(currMinute))
			currMinute = 0;
		return currMinute;
	}
	getMoment(dt?: any) {
		if (!moment.tz || !this.timezone) return moment(dt);
		return moment.tz(dt, this.timezone);
	}
	refreshCalendarDates() {
		if (!this.selectedDate) {
			this.selectedDate = this.getMoment();
			this.selectedDate.hours(0);
			this.selectedDate.minutes(0);
			this.selectedDate.seconds(0);
		}
		if (!this.selectedMonth)
			this.selectedMonth = this.getMoment(this.selectedDate).month() + 1;
		if (!this.selectedYear)
			this.selectedYear = this.getMoment(this.selectedDate).year();
		if (!this.selectedHour) {
			let hour = this.getMoment(this.selectedDate).hour();
			if (hour >= 12) {
				if (hour > 12)
					hour -= 12;
				this.selectedAMPM = 'PM';
			}
			else {
				this.selectedAMPM = 'AM';
			}
			this.selectedHour = hour.toString();
		}
		if (!this.selectedMinute) {
			var minute = this.getMoment(this.selectedDate).minute();
			if (this.minuteStep > 1) {
				while (minute % this.minuteStep != 0) {
					minute--;
				}
			}
			this.selectedMinute = minute.toString();
			this.formatMinute();
		}
		let startDate = this.getMoment(this.selectedMonth.toString() + "/01/" + this.selectedYear.toString());
		while (startDate.day() > 0) {
			startDate.date(startDate.date() - 1);
		}
		this.calendarDates = [];
		for (let i = 0; i < 42; i++) {
			let weekNum = Math.floor(i / 7);
			if (!this.calendarDates[weekNum])
				this.calendarDates[weekNum] = [];
			this.calendarDates[weekNum][i % 7] = this.getMoment(startDate);
			startDate.add(1, 'd');
		}
	}
	formatMinute() {
		let currMinute = this.getMinuteInt();
		this.selectedMinute = "00".substring(0, 2 - currMinute.toString().length) + currMinute.toString();
	}
	private getHourInt() {
		let currHour = parseInt(this.selectedHour);
		if (isNaN(currHour))
			currHour = 0;
		return currHour;
	}
	formatHour() {
		let currHour = this.getHourInt();
		this.selectedHour = currHour.toString();
	}
	selectNow() {
		this.updateDateTimeControls(this.getMoment());
	}
	showDropdown() {
		this.dropdownVisible = !this.dropdownVisible;
		if (this._innerValue)
			this.updateDateTimeControls(this._innerValue);
	}
	updateDateTimeControls(newDateTime: any) {
		this.selectedDate = newDateTime;
		this.selectedMonth = null;
		this.selectedYear = null;
		this.selectedHour = null;
		this.selectedMinute = null;
		this.selectedAMPM = null;
		this.refreshCalendarDates();
	}
	datesAreEqual(date: any) {
		if (!this.selectedDate) return false;
		if (!date) return false;
		return this.selectedDate.format("MMDDYYYY") == date.format("MMDDYYYY");
	}
	addMonth(backwards) {
		this.selectedMonth += (backwards ? -1 : 1);
		if (this.selectedMonth <= 0) {
			this.selectedMonth = 12;
			this.selectedYear--;
		}
		else if (this.selectedMonth > 12) {
			this.selectedMonth = 1;
			this.selectedYear++;
		}
		this.refreshCalendarDates();
	}
	addYear(backwards) {
		this.selectedYear += (backwards ? -1 : 1);
		this.refreshCalendarDates();
	}
	addHour(backwards) {
		var hour = this.getHourInt();
		hour += (backwards ? -1 : 1);
		let toggleAMPM = false;
		if (!backwards) {
			if (hour > 12) {
				hour = 1;
			}
			else if (hour > 11) {
				toggleAMPM = true;
			}
		}
		else {
			if (hour < 1) {
				hour = 12;
			}
			else if (hour == 11) {
				toggleAMPM = true;
			}
		}
		this.selectedHour = hour.toString();
		if (toggleAMPM) {
			this.selectedAMPM = this.selectedAMPM == 'AM' ? 'PM' : 'AM';
		}
	}
	selectDate(date, fromInput = false) {
		if (!fromInput && ((this.minDate && date < this.minDate) || (this.maxDate && date > this.maxDate)))
			return;
		this.selectedDate = date;
		if (this.selectOnCalendarClick || fromInput || this.hideTime) {
			this.persistDate(true, fromInput);
		}
	}
	persistDate(alreadySelected = false, fromInput = false) {
		// add hours minutes, seconds
		this.dropdownVisible = false;
		let selectedDate: any = null;
		if (!this.hideDate) {
			if (!alreadySelected)
				this.selectDate(this.selectedDate);
			selectedDate = this.getMoment(this.selectedDate);
		}
		else {
			selectedDate = this.getMoment();
			selectedDate.year(1900);
			selectedDate.month(0);
			selectedDate.date(1);
		}
		if (!this.hideTime) {
			if (!fromInput) {
				var hourToAdd = this.getHourInt();
				if (this.selectedAMPM == 'PM' && hourToAdd < 12) {
					hourToAdd += 12;
				}
				if (this.selectedAMPM == 'AM' && hourToAdd == 12) {
					hourToAdd = 0;
				}
				selectedDate.hour(hourToAdd);
				selectedDate.minute(this.getMinuteInt());
			}
		}
		else {
			selectedDate.hour(0);
			selectedDate.minute(0);
		}
		this.innerValue = selectedDate.toDate();
	}
	addMinute(backwards) {
		let currMinute = this.getMinuteInt();
		currMinute += (backwards ? -1 : 1) * (this.minuteStep || 1);
		if (currMinute < 0) {
			currMinute = 60 - (this.minuteStep || 1);
			this.addHour(true);
		}
		else if (currMinute > 59) {
			currMinute = 0;
			this.addHour(false);
		}
		this.selectedMinute = currMinute.toString();
		this.formatMinute();
	}
	writeValue(value: Date) {
		this._lock = true;
		if (value === undefined || value == null) {
			this.innerValue = null;
		}
		else if (!this.getMoment(value).isSame(this.innerValue)) {
			this._innerValue = this.getMoment(value);
		}
		this._lock = false;
		this.refreshCalendarDates();
	}
}