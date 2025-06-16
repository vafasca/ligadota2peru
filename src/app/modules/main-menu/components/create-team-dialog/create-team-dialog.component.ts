import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-team-dialog',
  templateUrl: './create-team-dialog.component.html',
  styleUrls: ['./create-team-dialog.component.css']
})
export class CreateTeamDialogComponent {
  teamForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      captainId: string, 
      captainName: string,
      category: string 
    },
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      description: ['', Validators.maxLength(40)]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.teamForm.valid) {
      this.dialogRef.close(this.teamForm.value);
    }
  }
}
