import { Component, EventEmitter, Output } from '@angular/core';
import { Tournament } from '../../../models/tournament.model';
import { PanelAdminService } from '../../../services/panel-admin.service';
import { TournamentConfigDialogComponent } from './tournament-config-dialog/tournament-config-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.css']
})
export class TournamentsComponent {
  recentTournaments: Tournament[] = [];
  @Output() openModal = new EventEmitter<void>();

  constructor(
    private tournamentService: PanelAdminService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadTournaments();
  }

  loadTournaments(): void {
    this.tournamentService.getTournaments().subscribe(tournaments => {
      this.recentTournaments = tournaments;
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  openTournamentModal(): void {
    this.openModal.emit();
  }

  formatDateRange(start: string, end: string): string {
    return `${start} - ${end}`;
  }

  openConfigDialog(tournament: Tournament): void {
  const dialogRef = this.dialog.open(TournamentConfigDialogComponent, {
    width: '50%',
    data: { tournament },
    panelClass: 'dota2-dialog'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Aquí puedes actualizar la lista de torneos si es necesario
      console.log('La configuración fue guardada');
    }
  });
}
}
