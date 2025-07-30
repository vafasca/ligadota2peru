import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';
import { TournamentService } from 'src/app/modules/tournament/services/tournament.service';
import { TournamentRegisterService } from '../../services/tournament-register.service';
import { NotificationService } from 'src/app/shared-services/notification.service';

@Component({
  selector: 'app-register-team-dialog',
  templateUrl: './register-team-dialog.component.html',
  styleUrls: ['./register-team-dialog.component.css']
})
export class RegisterTeamDialogComponent {
  tournaments: Tournament[] = [];
  isLoading = true;
  selectedTournament: string | null = null;
  isChecking = false;
  canRegister = false;
  registrationMessage = '';

  constructor(
    public dialogRef: MatDialogRef<RegisterTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team: Team },
    private tournamentService: TournamentRegisterService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadAvailableTournaments();
    this.checkRegistrationStatus();
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

  checkRegistrationStatus(): void {
    if (!this.selectedTournament) return;
    
    this.isChecking = true;
    this.tournamentService.canRegisterToTournament(this.data.team.id, this.selectedTournament)
      .subscribe({
        next: (result) => {
          this.canRegister = result.canRegister;
          this.registrationMessage = result.message || '';
          this.isChecking = false;
        },
        error: (err) => {
          this.canRegister = false;
          this.registrationMessage = 'Error al verificar inscripción';
          this.isChecking = false;
        }
      });
  }


onTournamentSelect(): void {
  if (this.selectedTournament) {
    this.checkRegistrationStatus();
  }
}

  onRegister(): void {
    if (!this.selectedTournament || !this.data.team || !this.canRegister) {
      this.notificationService.showError('No se puede completar la inscripción');
      return;
    }

    this.isLoading = true;
    this.tournamentService.registerTeamToTournament(
      this.selectedTournament, 
      this.data.team
    ).subscribe({
      next: (teamId) => {
        this.notificationService.showSuccess('Equipo registrado en el torneo');
        this.dialogRef.close(teamId);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.notificationService.showError(err.message || 'Error al registrar equipo');
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
