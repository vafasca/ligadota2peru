import { Component } from '@angular/core';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';
import { TournamentFormat } from '../../models/tournament-format.enum';
import { ActivatedRoute } from '@angular/router';
import { PanelAdminService } from 'src/app/modules/admin/services/panel-admin.service';
import { TournamentTeam } from '../../models/team.model';
import { TournamentRegisterService } from 'src/app/modules/main-menu/services/tournament-register.service';
import { LocalDatePipe } from 'src/app/shared-pipe/local-date.pipe';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-tournament-view',
  templateUrl: './tournament-view.component.html',
  styleUrls: ['./tournament-view.component.css']
})
export class TournamentViewComponent {
  tournamentId: string = '';
  tournament: Tournament | null = null;
  tournamentTeams: TournamentTeam[] = [];
  loading: boolean = true;
  activeTab: 'teams' | 'bracket' | 'rules' | 'details' = 'details';
  TournamentFormat = TournamentFormat;
  errorMessage: string | null = null;
  stats: any[] = [];
  customRules: string[] = [];
  registrationStatus: 'open' | 'closed' | 'upcoming' = 'closed';

  countdown: { days: number, hours: number, minutes: number, seconds: number } | null = null;
  countdownSubscription: Subscription | null = null;
  canRegister: boolean = false;

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
        this.updateRegistrationStatus();
        this.startCountdown();
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

  updateRegistrationStatus(): void {
    if (!this.tournament) return;
    
    const now = new Date();
    const regStart = new Date(this.tournament.registrationStartDate);
    const regEnd = new Date(this.tournament.registrationEndDate);
    
    if (now < regStart) {
      this.registrationStatus = 'upcoming';
    } else if (now >= regStart && now <= regEnd) {
      this.registrationStatus = 'open';
    } else {
      this.registrationStatus = 'closed';
    }

    this.checkRegistrationEligibility();
  }

  startCountdown(): void {
    if (!this.tournament) return;
    
    // Detener cualquier contador existente
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }

    const targetDate = this.registrationStatus === 'open' 
      ? new Date(this.tournament.registrationEndDate) 
      : new Date(this.tournament.registrationStartDate);

    this.countdownSubscription = interval(1000).subscribe(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        this.countdown = null;
        this.updateRegistrationStatus();
        return;
      }

      this.countdown = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    });
  }

  checkRegistrationEligibility(): void {
    // Implementa aquí tu lógica para verificar si el usuario puede registrarse
    // Por ejemplo: es capitán, tiene equipo completo, etc.
    // Esto es un placeholder - debes adaptarlo a tu aplicación
    
    // Ejemplo básico:
    this.canRegister = this.registrationStatus === 'open'; // && otras condiciones
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
      { icon: 'fas fa-ticket-alt', value: this.tournament.entryFee ? `$${this.tournament.entryFee}` : 'Gratis', label: 'Inscripción' },
      { 
        icon: 'fas fa-hourglass-half', 
        value: this.registrationStatus === 'open' ? 'Abiertas' : 
               this.registrationStatus === 'upcoming' ? 'Próximas' : 'Cerradas', 
        label: 'Inscripciones',
        status: this.registrationStatus
      }
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

  changeTab(tab: 'teams' | 'bracket' | 'rules' | 'details'): void {
    this.activeTab = tab;
  }

  formatDate(date: Date | string | null): string {
    if (!date) return 'No definida';
    const d = new Date(date);
    return d.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/La_Paz'
    });
  }

  getRegistrationStatusMessage(): string {
    if (!this.tournament) return '';
    
    switch (this.registrationStatus) {
      case 'open':
        return `Inscripciones abiertas hasta ${this.formatDate(this.tournament.registrationEndDate)}`;
      case 'upcoming':
        return `Inscripciones abren el ${this.formatDate(this.tournament.registrationStartDate)}`;
      case 'closed':
        return `Inscripciones cerradas desde el ${this.formatDate(this.tournament.registrationEndDate)}`;
      default:
        return '';
    }
  }

  registerToTournament(): void {
    if (!this.canRegister || !this.tournament) return;
    
    // Aquí implementa la lógica para registrar al equipo en el torneo
    // Puedes usar el diálogo que ya tienes o implementar una nueva lógica
    console.log('Registrando equipo en el torneo...');
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }
}
