import { Component, Input } from '@angular/core';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { TournamentTeam } from '../../models/team.model';
import { MatDialog } from '@angular/material/dialog';
import { TeamDialogViewComponent } from '../team-dialog-view/team-dialog-view.component';

@Component({
  selector: 'app-tournament-teams',
  templateUrl: './tournament-teams.component.html',
  styleUrls: ['./tournament-teams.component.css']
})
export class TournamentTeamsComponent {
 @Input() teams: TournamentTeam[] = [];

  constructor(
    private dialog: MatDialog,
  ) {}

  openTeamDetails(team: TournamentTeam): void {
    this.dialog.open(TeamDialogViewComponent, {
      data: team,
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'dota-dialog',
      backdropClass: 'dota-backdrop'
    });
  }

  trackByTeamId(index: number, team: TournamentTeam): string {
    return team.id;
  }
  
}
