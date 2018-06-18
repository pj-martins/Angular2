import { Injectable, Inject, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalDialogComponent, DialogResult, Button } from './modal-dialog.component';

@Injectable()
export class ModalDialogService {
    loading = false;

    yesNoDialog: ModalDialogComponent;

    showYesNoDialog(title, message): Observable<DialogResult> {
        this.yesNoDialog.headerText = title;
        this.yesNoDialog.bodyContent = message;
        return this.yesNoDialog.show(Button.YesNo);
    }
}
