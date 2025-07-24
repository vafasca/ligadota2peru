import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tournament } from '../../models/tournament.model';
import { PanelAdminService } from '../../services/panel-admin.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
activeTab: string = 'dashboard';
  showTournamentModal: boolean = false;
  tournamentForm: FormGroup;
  recentTournaments: Tournament[] = [];
  pendingMatches: any[] = [];
  reportedUsers: any[] = [];
  division1Users: any[] = [];
  division2Users: any[] = [];
  moderators: any[] = [];
  activeUserTab: string = 'division1';
  
  stats = [
    { id: 1, title: 'Torneos Activos', value: 0, icon: 'fas fa-trophy' },
    { id: 2, title: 'Partidos Pendientes', value: 0, icon: 'fas fa-gamepad' },
    { id: 3, title: 'Reportes Recientes', value: 0, icon: 'fas fa-flag' },
    { id: 4, title: 'Jugadores División 1', value: 0, icon: 'fas fa-user' },
    { id: 5, title: 'Jugadores División 2', value: 0, icon: 'fas fa-users' },
    { id: 6, title: 'Moderadores', value: 0, icon: 'fas fa-user-shield' }
  ];
  
  recentActivities = [
    { 
      type: 'tournament', 
      icon: 'fas fa-trophy', 
      description: 'Nuevo torneo "Dota 2 Championship" creado por el administrador', 
      time: 'Hace 2 horas' 
    },
    { 
      type: 'report', 
      icon: 'fas fa-flag', 
      description: 'Usuario "toxic_player" reportado por comportamiento inapropiado en partida', 
      time: 'Hace 4 horas' 
    },
    { 
      type: 'user', 
      icon: 'fas fa-user', 
      description: 'Nuevo jugador registrado en División 2 - usuario: new_player123', 
      time: 'Hace 6 horas' 
    }
  ];

  constructor(
    private fb: FormBuilder,
    private tournamentService: PanelAdminService
  ) {
    this.tournamentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4)]],
      game: ['Dota 2', Validators.required],
      format: ['Single Elimination', Validators.required],
      maxTeams: [16, [Validators.required, Validators.min(4), Validators.max(32)]],
      startDate: ['', Validators.required],
      prizePool: [''],
      entryFee: [0, [Validators.min(0)]],
      rules: ['']
    });
  }

  ngOnInit(): void {
    this.loadTournaments();
    this.loadPendingMatches();
    this.loadStats();
  }

  loadTournaments(): void {
    this.tournamentService.getTournaments().subscribe(tournaments => {
      this.recentTournaments = tournaments;
      console.log('Torneos cargados:', tournaments);
      // Actualizar estadísticas
      this.stats[0].value = tournaments.filter(t => t.status === 'En progreso').length;
    });
  }

  loadPendingMatches(): void {
    // Obtener partidos pendientes de todos los torneos
    // Esto es un ejemplo simplificado - en producción necesitarías una mejor implementación
    this.tournamentService.getTournaments().subscribe(tournaments => {
      const pendingMatches: any[] = [];
      tournaments.forEach(tournament => {
        this.tournamentService.getPendingMatches(tournament.id!).subscribe(matches => {
          pendingMatches.push(...matches.map(m => ({
            ...m,
            tournament: tournament.name
          })));
          this.pendingMatches = pendingMatches;
          this.stats[1].value = pendingMatches.length;
        });
      });
    });
  }

  loadStats(): void {
    // Aquí cargarías otras estadísticas desde sus respectivos servicios
    // Por ejemplo:
    // this.userService.getDivision1Users().subscribe(users => {
    //   this.stats[3].value = users.length;
    // });
    // etc.
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  openTournamentModal(): void {
    this.showTournamentModal = true;
  }

  closeTournamentModal(): void {
    this.showTournamentModal = false;
    this.tournamentForm.reset({
      game: 'Dota 2',
      format: 'Single Elimination',
      maxTeams: 16,
      entryFee: 0
    });
  }

  submitTournamentForm(): void {
    if (this.tournamentForm.valid) {
      const tournamentData: Tournament = {
        ...this.tournamentForm.value,
        currentTeams: 0,
        status: 'Programado',
        createdBy: 'moderator-id', // Reemplazar con el ID real del moderador
        createdAt: new Date(),
        startDate: new Date(this.tournamentForm.value.startDate)
      };

      this.tournamentService.createTournament(tournamentData).subscribe({
        next: (tournamentId) => {
          console.log('Torneo creado con ID:', tournamentId);
          this.closeTournamentModal();
          this.loadTournaments(); // Recargar la lista de torneos
        },
        error: (err) => {
          console.error('Error al crear torneo:', err);
          // Mostrar mensaje de error al usuario
        }
      });
    }
  }

  getHeaderTitle(): string {
    switch (this.activeTab) {
      case 'dashboard': return 'Panel de Control';
      case 'tournaments': return 'Gestión de Torneos';
      case 'matches': return 'Partidos Pendientes';
      case 'users': return 'Gestión de Usuarios';
      case 'reports': return 'Reportes de Usuarios';
      default: return 'Panel de Moderador';
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }
}
