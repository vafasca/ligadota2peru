import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-challenge-dialog',
  templateUrl: './confirm-challenge-dialog.component.html',
  styleUrls: ['./confirm-challenge-dialog.component.css']
})
export class ConfirmChallengeDialogComponent {
constructor(
    public dialogRef: MatDialogRef<ConfirmChallengeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { teamName: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
