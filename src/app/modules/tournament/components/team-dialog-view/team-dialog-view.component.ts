import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TournamentTeam } from '../../models/team.model';

@Component({
  selector: 'app-team-dialog-view',
  templateUrl: './team-dialog-view.component.html',
  styleUrls: ['./team-dialog-view.component.css']
})
export class TeamDialogViewComponent {
constructor(
    public dialogRef: MatDialogRef<TeamDialogViewComponent>,
    @Inject(MAT_DIALOG_DATA) public team: TournamentTeam
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
