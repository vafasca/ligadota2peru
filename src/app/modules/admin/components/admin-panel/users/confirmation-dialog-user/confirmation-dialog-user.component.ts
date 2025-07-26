import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog-user',
  templateUrl: './confirmation-dialog-user.component.html',
  styleUrls: ['./confirmation-dialog-user.component.css']
})
export class ConfirmationDialogUserComponent {
reason: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      isDestructive?: boolean;
      showReasonInput?: boolean;
      reasonLabel?: string;
      placeholder?: string;
    }
  ) {}
}
