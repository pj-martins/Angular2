import { forwardRef, Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { GridView, DetailGridView, RowArguments } from './gridview';
import { IGridViewComponent, IDetailGridViewComponent } from './gridview-interfaces';

@Component({
	selector: 'detail-gridview',
	template: "<gridview #gridViewComponent [grid]='detailGridViewInstance'></gridview>",
})
export class DetailGridViewComponent implements OnInit, IDetailGridViewComponent {
	@Input() parentGridViewComponent: IGridViewComponent;
	@Input() detailGridView: DetailGridView;
	@Input() row: any;

	@ViewChild("gridViewComponent") gridViewComponent: IGridViewComponent;

	detailGridViewInstance: DetailGridView;
	private _expanded: boolean;
	private _inited: boolean;

	private get parentKeyFieldName() {
		return this.parentGridViewComponent.grid.keyFieldName;
	}

	private editParent(args: RowArguments) {
		if ((<DetailGridView>args.grid).parentRow[this.parentKeyFieldName] == this.row[this.parentKeyFieldName]) {
			if (!this.parentGridViewComponent.editingRows[this.row[this.parentKeyFieldName]])
				this.parentGridViewComponent.editRow(this.row);
		}
	}

	get isExpanded() {
		return this._expanded;
	}

	ngOnInit() {
		this.detailGridViewInstance = this.detailGridView.createInstance(this.row);
		if (this.detailGridView.allowEdit && this.parentGridViewComponent.grid.allowEdit) {
			this.detailGridViewInstance.rowEdit.subscribe((args: RowArguments) => this.editParent(args));
			this.detailGridViewInstance.rowDelete.subscribe((args: RowArguments) => this.editParent(args));
			this.detailGridViewInstance.rowCreate.subscribe((args: RowArguments) => this.editParent(args));
		}
		this.parentGridViewComponent.detailGridViewComponents[this.row[this.parentKeyFieldName]] = this;
	}

	expandCollapse() {
		this._expanded = !this._expanded;
		if (!this._inited) {
			this._inited = true;
			this.detailGridView.getChildData(this.row).subscribe(d => this.detailGridViewInstance.data = d);
		}
	}
}