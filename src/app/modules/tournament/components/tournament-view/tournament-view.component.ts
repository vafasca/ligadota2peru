import { Component } from '@angular/core';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';
import { TournamentFormat } from '../../models/tournament-format.enum';
import { ActivatedRoute } from '@angular/router';
import { PanelAdminService } from 'src/app/modules/admin/services/panel-admin.service';

@Component({
  selector: 'app-tournament-view',
  templateUrl: './tournament-view.component.html',
  styleUrls: ['./tournament-view.component.css']
})
export class TournamentViewComponent {
  tournamentId: string = '';
  tournament: Tournament | null = null;
  teams: Team[] = [];
  loading: boolean = true;
  activeTab: 'teams' | 'bracket' = 'teams';
  TournamentFormat = TournamentFormat;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private tournamentService: PanelAdminService
  ) {}

  ngOnInit(): void {
    this.tournamentId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTournament();
    this.loadTeams();
  }

  loadTournament(): void {
    this.tournamentService.getTournament(this.tournamentId).subscribe({
      next: (tournament) => {
        if (!tournament) {
          console.log('Tournament not found');
          this.errorMessage = 'Torneo no encontrado';
          this.loading = false;
          return;
        }
        this.tournament = tournament;
        this.loadTeams();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el torneo';
        console.error('Error loading tournament:', err);
        this.loading = false;
      }
    });
  }

  loadTeams(): void {
    if (!this.tournamentId) return;
    console.log('Loading teams for tournament:', this.tournamentId);
    this.tournamentService.getTournamentTeams(this.tournamentId).subscribe({
      next: (teams) => {
        this.teams = teams;
      },
      error: (err) => {
        console.error('Error loading teams:', err);
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
