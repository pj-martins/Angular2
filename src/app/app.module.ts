import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParserService } from '../lib/services/parser.service';
import { AppComponent } from './app.component';
import { GridViewModule } from '../lib/gridview';
import { TreeViewModule } from '../lib/treeview';
import { CheckListModule } from '../lib/checklist';
import { OverlayModule } from '../lib/overlay';
import { TypeaheadModule } from '../lib/typeahead';
import { DateTimePickerModule } from '../lib/datetime-picker';
import { MultiTextboxModule } from '../lib/multi-textbox';
import { ExpandCollapseModule } from '../lib/expand-collapse';
import { ModalDialogModule } from '../lib/modal-dialog';
import { PipesModule } from '../lib/pipes';
import { routing } from './app.routing';
import { DemoGridComponent } from './demo/demo-grid.component';
import { DemoEditorsComponent } from './demo/demo-editors.component';
import { DemoTreeComponent } from './demo/demo-tree.component';
import { DemoModalComponent } from './demo/demo-modal.component';

import { CoordinatorFilterCellTemplateComponent, CustomerCellTemplateComponent, EventTypeFilterCellTemplateComponent, RequestedByFilterCellTemplateComponent, CustomerCellEditTemplateComponent } from './demo/grid-cell-templates.component';
import { RoomNodeTemplateComponent } from './demo/treeview-templates.component';
import { RoomComponent } from './demo/room.component';
import { DemoGridBasicComponent } from './demo/demo-grid-basic.component';

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		GridViewModule,
		TreeViewModule,
		OverlayModule,
		TypeaheadModule,
		PipesModule,
		CheckListModule,
		DateTimePickerModule,
		MultiTextboxModule,
		ExpandCollapseModule,
		ModalDialogModule,
		routing
	],
	providers: [ParserService],
	declarations: [
		AppComponent,
		DemoGridComponent,
		DemoTreeComponent,
		DemoEditorsComponent,
		DemoModalComponent,
		DemoGridBasicComponent,

		CoordinatorFilterCellTemplateComponent,
		CustomerCellTemplateComponent,
		CustomerCellEditTemplateComponent,
		EventTypeFilterCellTemplateComponent,
		RequestedByFilterCellTemplateComponent,
		RoomComponent,
		RoomNodeTemplateComponent,
	],
	entryComponents: [
		CoordinatorFilterCellTemplateComponent,
		CustomerCellTemplateComponent,
		EventTypeFilterCellTemplateComponent,
		RequestedByFilterCellTemplateComponent,
		RoomComponent,
		RoomNodeTemplateComponent,
		CustomerCellEditTemplateComponent
	],
	bootstrap: [AppComponent]
})
export class AppModule { }