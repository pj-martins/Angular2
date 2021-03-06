﻿import { Component, Input, Output, EventEmitter, OnInit, NgZone } from '@angular/core';
import { ParserService } from '../services/parser.service';
import { TYPEAHEAD_TEMPLATE, Typeahead } from './typeahead';


@Component({
	selector: 'typeahead',
	template: TYPEAHEAD_TEMPLATE,
	styleUrls: ['../assets/css/styles.css', '../assets/css/icons.css', '../assets/css/buttons.css', 'typeahead.css']
})
export class TypeaheadComponent implements OnInit {
	
	@Output() focus = new EventEmitter<any>();

	typeahead: Typeahead;

	constructor(private parserService: ParserService, private zone: NgZone) {
		this.typeahead = new Typeahead(this.parserService);
	}

	ngOnInit() {
		this.typeahead.initTypeahead(this, document);
	}
}