﻿import { Component, Input, Compiler, ViewContainerRef, ViewChild, Injectable, OnInit, Directive, ComponentFactoryResolver, ComponentRef, ElementRef } from '@angular/core';
import { GridView } from './gridview';
import { DataColumn } from './gridview-columns';
import { IGridViewFilterCellComponent, IGridViewFilterCellTemplateComponent } from './gridview-interfaces';
import { FieldType } from './gridview-enums';
import { GridViewFilterCellComponent } from './gridview-filtercell.component';
import { PipesModule } from '../pipes';

@Directive({
	selector: '[gridviewFilterCellTemplate]'
})
export class GridViewFilterCellTemplateDirective implements OnInit, IGridViewFilterCellTemplateComponent {
	private _component: ComponentRef<IGridViewFilterCellTemplateComponent>;
	@Input() column: DataColumn;
	@Input() row: any;
	@Input() parentGridView: GridView;
	@Input() parentFilterCellComponent: IGridViewFilterCellComponent;

	constructor(private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef, private elementRef: ElementRef) {
		//this.elementRef.nativeElement.parentNode.removeChild(this.elementRef.nativeElement);
	}

	ngOnInit() {
		let factory = this.componentFactoryResolver.resolveComponentFactory(this.column.filterTemplate);
		this._component = this.viewContainerRef.createComponent(factory);
		this._component.instance.column = this.column;
		this._component.instance.parentGridView = this.parentGridView;
		this._component.instance.parentFilterCellComponent = this.parentFilterCellComponent;
	}
}