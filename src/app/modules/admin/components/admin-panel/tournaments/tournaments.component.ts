import { Component, EventEmitter, Output } from '@angular/core';
import { Tournament } from '../../../models/tournament.model';
import { PanelAdminService } from '../../../services/panel-admin.service';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.css']
})
export class TournamentsComponent {
  recentTournaments: Tournament[] = [];
  @Output() openModal = new EventEmitter<void>();

  constructor(private tournamentService: PanelAdminService) {}

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
}
