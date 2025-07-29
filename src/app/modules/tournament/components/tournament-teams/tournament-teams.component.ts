import { Component, Input } from '@angular/core';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { TournamentTeam } from '../../models/team.model';

@Component({
  selector: 'app-tournament-teams',
  templateUrl: './tournament-teams.component.html',
  styleUrls: ['./tournament-teams.component.css']
})
export class TournamentTeamsComponent {
  @Input() teams: TournamentTeam[] = [];
}
