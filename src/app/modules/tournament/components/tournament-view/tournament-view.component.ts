import { Component } from '@angular/core';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';
import { TournamentFormat } from '../../models/tournament-format.enum';
import { ActivatedRoute } from '@angular/router';
import { PanelAdminService } from 'src/app/modules/admin/services/panel-admin.service';
import { TournamentTeam } from '../../models/team.model';
import { TournamentRegisterService } from 'src/app/modules/main-menu/services/tournament-register.service';

@Component({
  selector: 'app-tournament-view',
  templateUrl: './tournament-view.component.html',
  styleUrls: ['./tournament-view.component.css']
})
export class TournamentViewComponent {
  tournamentId: string = '';
  tournament: Tournament | null = null;
  tournamentTeams: TournamentTeam[] = [];
  teams: TournamentTeam[] = [];
  loading: boolean = true;
  activeTab: 'teams' | 'bracket' = 'teams';
  TournamentFormat = TournamentFormat;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private tournamentService: PanelAdminService,
    private tournamentRegisterService: TournamentRegisterService
  ) {}

  ngOnInit(): void {
    this.tournamentId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTournament();
  }

  loadTournament(): void {
    this.tournamentService.getTournament(this.tournamentId).subscribe({
      next: (tournament) => {
        if (!tournament) {
          this.errorMessage = 'Torneo no encontrado';
          this.loading = false;
          return;
        }
        this.tournament = tournament;
        this.loadTournamentTeams();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el torneo';
        console.error('Error loading tournament:', err);
        this.loading = false;
      }
    });
  }

  loadTournamentTeams(): void {
    this.tournamentRegisterService.getTournamentTeams(this.tournamentId).subscribe({
      next: (teams) => {
        this.tournamentTeams = teams;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los equipos del torneo';
        console.error('Error loading tournament teams:', err);
        this.loading = false;
      }
    });
  }
  
  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  changeTab(tab: 'teams' | 'bracket'): void {
    this.activeTab = tab;
  }
}
