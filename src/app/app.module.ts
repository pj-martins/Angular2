import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParserService } from '../lib/services/parser.service';
import { AppComponent } from './app.component';
import { GridViewModule } from '../lib/gridview/gridview.module';
import { TreeViewModule } from '../lib/treeview/treeview.module';
import { CheckListModule } from '../lib/checklist/checklist.module';
import { OverlayModule } from '../lib/overlay/overlay.module';
import { TypeaheadModule } from '../lib/typeahead/typeahead.module';
import { DateTimePickerModule } from '../lib/datetime-picker/datetime-picker.module';
import { MultiTextboxModule } from '../lib/multi-textbox/multi-textbox.module';
import { ExpandCollapseModule } from '../lib/expand-collapse/expand-collapse.module';
import { ModalDialogModule } from '../lib/modal-dialog/modal-dialog.module';
import { PipesModule } from '../lib/pipes/pipes.module';
import { routing } from './app.routing';
import { DemoGridComponent } from './demo/demo-grid.component';
import { DemoEditorsComponent } from './demo/demo-editors.component';
import { DemoTreeComponent } from './demo/demo-tree.component';
import { DemoModalComponent } from './demo/demo-modal.component';

import { CoordinatorFilterCellTemplateComponent, CustomerCellTemplateComponent, EventTypeFilterCellTemplateComponent, RequestedByFilterCellTemplateComponent, CustomerCellEditTemplateComponent } from './demo/grid-cell-templates.component';
import { RoomNodeTemplateComponent } from './demo/treeview-templates.component';
import { RoomComponent } from './demo/room.component';

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