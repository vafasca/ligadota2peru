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
  registrationStatus: 'open' | 'closed' | 'pending' = 'closed';

  // Contadores para inicio y fin de inscripciones
  daysToStart: number = 0;
  hoursToStart: number = 0;
  minutesToStart: number = 0;
  secondsToStart: number = 0;
  
  daysToEnd: number = 0;
  hoursToEnd: number = 0;
  minutesToEnd: number = 0;
  secondsToEnd: number = 0;

  countdownInterval: Subscription | null = null;
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
        this.startCountdowns();
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
      this.registrationStatus = 'pending';
    } else if (now >= regStart && now <= regEnd) {
      this.registrationStatus = 'open';
    } else {
      this.registrationStatus = 'closed';
    }

    this.checkRegistrationEligibility();
  }

  startCountdowns(): void {
  // Detener cualquier contador existente
  if (this.countdownInterval) {
    this.countdownInterval.unsubscribe();
  }

  // Actualizar contadores inmediatamente
  this.updateCountdowns();

  // Actualizar contadores cada segundo (1000 ms)
  this.countdownInterval = interval(1000).subscribe(() => {
    this.updateCountdowns();
  });
}

  updateCountdowns(): void {
  if (!this.tournament) return;

  const now = new Date();
  const regStart = new Date(this.tournament.registrationStartDate);
  const regEnd = new Date(this.tournament.registrationEndDate);

  // Contador para inicio de inscripciones
  const diffStart = regStart.getTime() - now.getTime();
  this.daysToStart = Math.max(0, Math.floor(diffStart / (1000 * 60 * 60 * 24)));
  this.hoursToStart = Math.max(0, Math.floor((diffStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  this.minutesToStart = Math.max(0, Math.floor((diffStart % (1000 * 60 * 60)) / (1000 * 60)));
  this.secondsToStart = Math.max(0, Math.floor((diffStart % (1000 * 60)) / 1000));

  // Contador para fin de inscripciones
  const diffEnd = regEnd.getTime() - now.getTime();
  this.daysToEnd = Math.max(0, Math.floor(diffEnd / (1000 * 60 * 60 * 24)));
  this.hoursToEnd = Math.max(0, Math.floor((diffEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  this.minutesToEnd = Math.max(0, Math.floor((diffEnd % (1000 * 60 * 60)) / (1000 * 60)));
  this.secondsToEnd = Math.max(0, Math.floor((diffEnd % (1000 * 60)) / 1000));

  // Si el tiempo ha expirado, actualizar el estado
  if (diffStart <= 0 || diffEnd <= 0) {
    this.updateRegistrationStatus();
  }
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
      { icon: 'fas fa-ticket-alt', value: this.tournament.entryFee ? `$${this.tournament.entryFee}` : 'Gratis', label: 'Inscripción' }
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
      case 'pending':
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

  isCountdownUrgent(): boolean {
  if (this.registrationStatus === 'pending') {
    return this.daysToStart === 0 && this.hoursToStart < 24;
  } else if (this.registrationStatus === 'open') {
    return this.daysToEnd === 0 && this.hoursToEnd < 24;
  }
  return false;
}

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      this.countdownInterval.unsubscribe();
    }
  }
}
