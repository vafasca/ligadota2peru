import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tournament } from '../../models/tournament.model';
import { PanelAdminService } from '../../services/panel-admin.service';
import { TournamentService } from 'src/app/modules/tournament/services/tournament.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  activeTab: string = 'dashboard';
  showTournamentModal: boolean = false;

  constructor(private tournamentService: PanelAdminService) {}

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

  onTabChange(tab: string): void {
    this.activeTab = tab;
  }

  onOpenTournamentModal(): void {
    this.showTournamentModal = true;
  }

  onCloseTournamentModal(): void {
    this.showTournamentModal = false;
  }

  // Añade este método para manejar el evento de torneo creado
  onTournamentCreated(tournament: Tournament): void {
    this.tournamentService.createTournament(tournament).subscribe({
      next: (id) => {
        console.log('Torneo creado con ID:', id);
        this.onCloseTournamentModal();
        // Aquí podrías recargar la lista de torneos si es necesario
      },
      error: (err) => {
        console.error('Error al crear torneo:', err);
      }
    });
  }
}
