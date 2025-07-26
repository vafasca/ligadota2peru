import { Component } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
stats = [
    { id: 1, title: 'Torneos Activos', value: '0', icon: 'fas fa-trophy' },
    { id: 2, title: 'Partidos Pendientes', value: '0', icon: 'fas fa-gamepad' },
    { id: 3, title: 'Reportes Recientes', value: '0', icon: 'fas fa-flag' },
    { id: 4, title: 'Jugadores División 1', value: '0/0', icon: 'fas fa-users' },
    { id: 5, title: 'Jugadores División 2', value: '0/0', icon: 'fas fa-users' },
    { id: 6, title: 'Moderadores', value: '0/0', icon: 'fas fa-user-shield' }
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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats[0].value = stats.activeTournaments.toString();
        this.stats[3].value = `${stats.division1Players.active}/${stats.division1Players.total}`;
        this.stats[4].value = `${stats.division2Players.active}/${stats.division2Players.total}`;
        this.stats[5].value = `${stats.moderators.active}/${stats.moderators.total}`; // Actualizamos moderadores
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      }
    });
  }
}
