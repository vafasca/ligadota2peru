import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';
import { TournamentService } from 'src/app/modules/tournament/services/tournament.service';
import { TournamentRegisterService } from '../../services/tournament-register.service';

@Component({
  selector: 'app-register-team-dialog',
  templateUrl: './register-team-dialog.component.html',
  styleUrls: ['./register-team-dialog.component.css']
})
export class RegisterTeamDialogComponent {
  tournaments: Tournament[] = [];
  isLoading = true;
  selectedTournament: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<RegisterTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team: Team },
    private tournamentService: TournamentRegisterService
  ) {}

  ngOnInit(): void {
    this.loadAvailableTournaments();
  }

  loadAvailableTournaments(): void {
    this.tournamentService.getActiveTournaments().subscribe({
      next: (tournaments) => {
        this.tournaments = tournaments.filter(t => 
          t.currentTeams < t.maxTeams && 
          (!t.teams || !t.teams.includes(this.data.team.id))
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tournaments:', err);
        this.isLoading = false;
      }
    });
  }

  onRegister(): void {
    if (this.selectedTournament) {
      this.dialogRef.close(this.selectedTournament);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
