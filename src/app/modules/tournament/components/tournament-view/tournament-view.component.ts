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
  activeTab: 'teams' | 'bracket' | 'rules' = 'teams';
  TournamentFormat = TournamentFormat;
  errorMessage: string | null = null;
  stats: any[] = [];
  customRules: string[] = [];

  formatDescriptions: Record<string, {title: string, description: string, rules: string[]}> = {
    'Single Elimination': {
      title: 'Eliminación Simple',
      description: 'Formato rápido donde los equipos son eliminados tras una derrota. Ideal para torneos con muchos participantes y tiempo limitado.',
      rules: [
        'Cada partido es eliminatorio',
        'El perdedor queda fuera del torneo',
        'Rápido de organizar y ejecutar',
        'Puede no ser el más justo para determinar al mejor equipo'
      ]
    },
    'Double Elimination': {
      title: 'Doble Eliminación',
      description: 'Formato competitivo donde los equipos tienen que perder dos veces antes de ser eliminados. Más justo que la eliminación simple.',
      rules: [
        'Los equipos tienen que perder dos veces para ser eliminados',
        'Los perdedores de la ronda de ganadores pasan a la ronda de perdedores',
        'Más justo que Single Elimination',
        'Toma más tiempo que Single Elimination'
      ]
    },
    'Round Robin': {
      title: 'Round Robin',
      description: 'Todos los equipos juegan contra todos los demás. Ideal para torneos pequeños donde se quiere determinar claramente al mejor equipo.',
      rules: [
        'Cada equipo juega contra todos los demás',
        'Se otorgan puntos por victorias/empates',
        'El equipo con más puntos gana',
        'Muy justo pero requiere más tiempo'
      ]
    },
    'Swiss': {
      title: 'Sistema Suizo',
      description: 'Los equipos son emparejados contra oponentes con un rendimiento similar. Buen equilibrio entre justicia y tiempo.',
      rules: [
        'Emparejamientos basados en rendimiento',
        'Nadie es eliminado temprano',
        'Bueno para torneos con muchos participantes',
        'Requiere sistema de puntuación claro'
      ]
    },
    'League + Playoffs': {
      title: 'Liga + Playoffs',
      description: 'Fase de grupos seguida de eliminatorias. Ideal para torneos largos y profesionales.',
      rules: [
        'Fase de liga donde todos juegan contra todos',
        'Los mejores avanzan a playoffs eliminatorios',
        'Combina lo mejor de Round Robin y Eliminación',
        'Requiere mucho tiempo y organización'
      ]
    }
  };

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
        console.log('Torneo cargado:', this.tournament);
        this.prepareStats();
        this.prepareCustomRules();
        this.loadTournamentTeams();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el torneo';
        console.error('Error loading tournament:', err);
        this.loading = false;
      }
    });
  }

  prepareCustomRules(): void {
    if (!this.tournament || !this.tournament.rules) {
      this.customRules = [];
      return;
    }
    
    this.customRules = this.tournament.rules
      .split('\n')
      .map(rule => rule.trim())
      .filter(rule => rule.length > 0);
  }

  prepareStats(): void {
    if (!this.tournament) return;
    
    this.stats = [
      { icon: 'fas fa-users', value: `${this.tournament.currentTeams}/${this.tournament.maxTeams}`, label: 'Equipos' },
      { icon: 'fas fa-coins', value: this.tournament.prizePool || 'N/A', label: 'Premio' },
      { icon: 'fas fa-ticket-alt', value: this.tournament.entryFee || 'Gratis', label: 'Inscripción' }
    ];
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

  changeTab(tab: 'teams' | 'bracket' | 'rules'): void {
    this.activeTab = tab;
  }
}
