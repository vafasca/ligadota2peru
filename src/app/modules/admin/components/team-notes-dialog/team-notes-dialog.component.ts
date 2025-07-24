import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-team-notes-dialog',
  templateUrl: './team-notes-dialog.component.html',
  styleUrls: ['./team-notes-dialog.component.css']
})
export class TeamNotesDialogComponent {
notes: string;

  constructor(
    public dialogRef: MatDialogRef<TeamNotesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {teamName: string, notes: string}
  ) {
    this.notes = data.notes || '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.notes);
  }
}
