import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';
import { TournamentService } from 'src/app/modules/tournament/services/tournament.service';
import { TournamentRegisterService } from '../../services/tournament-register.service';
import { NotificationService } from 'src/app/shared-services/notification.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';

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
  selectedLogo: File | null = null;
  logoPreview: SafeUrl | string | null = null;
  maxLogoSize = 500 * 1024; // 500KB
  logoError: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<RegisterTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team: Team },
    private tournamentService: TournamentRegisterService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadAvailableTournaments();
    if (this.data.team.logo) {
      this.logoPreview = this.data.team.logo;
    }
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

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Resetear error previo
      this.logoError = null;

      // Validar tamaño
      if (file.size > this.maxLogoSize) {
        this.logoError = `El logo es demasiado grande (${Math.round(file.size / 1024)}KB). Máximo: 500KB`;
        return;
      }

      // Validar dimensiones
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const aspectRatio = width / height;
        
        if (aspectRatio < 0.5 || aspectRatio > 2) {
          this.logoError = 'El logo debe tener proporciones entre 0.5 y 2 (ancho/alto)';
          return;
        }
        
        this.selectedLogo = file;
        this.logoPreview = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
      };
      img.onerror = () => {
        this.logoError = 'La imagen no es válida';
      };
      img.src = URL.createObjectURL(file);
    }
  }

  removeLogo(): void {
    this.selectedLogo = null;
    this.logoPreview = null;
    this.logoError = '';
  }

  checkRegistrationStatus(): void {
    if (!this.selectedTournament) return;
    
    this.isChecking = true;
    this.canRegister = false; // Resetear estado previo
    this.registrationMessage = '';
    
    this.tournamentService.canRegisterToTournament(this.data.team.id, this.selectedTournament)
      .pipe(
        finalize(() => {
          this.isChecking = false;
          console.log('Verificación completada:', {
            canRegister: this.canRegister,
            message: this.registrationMessage,
            logoError: this.logoError,
            selectedTournament: this.selectedTournament
          });
        })
      )
      .subscribe({
        next: (result) => {
          this.canRegister = result.canRegister;
          this.registrationMessage = result.message || '';
          console.log('Resultado verificación:', result);
        },
        error: (err) => {
          this.canRegister = false;
          this.registrationMessage = 'Error al verificar requisitos';
          console.error('Error en verificación:', err);
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
    
    // Crear objeto de equipo con logo
    const teamToRegister = {
      ...this.data.team,
      logo: this.logoPreview?.toString() || this.data.team.logo || 'assets/default-team-logo.png'
    };

    this.tournamentService.registerTeamToTournament(
      this.selectedTournament, 
      teamToRegister
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

  // Añade este método a tu componente para mostrar abreviaturas de roles
getRoleAbbreviation(role: string): string {
  const abbreviations: {[key: string]: string} = {
    'CARRY': 'C',
    'MID': 'M',
    'OFFLANE': 'O',
    'SUPPORT': 'S',
    'HARD SUPPORT': 'HS'
  };
  return abbreviations[role.toUpperCase()] || role.charAt(0).toUpperCase();
}

  onCancel(): void {
    this.dialogRef.close();
  }
}
