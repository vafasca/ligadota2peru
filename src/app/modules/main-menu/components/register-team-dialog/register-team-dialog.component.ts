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
  isLogoRequired = true;

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

    // Validar tamaño máximo (500KB)
    const MAX_SIZE = 500 * 1024;
    if (file.size > MAX_SIZE) {
      this.logoError = `El logo es demasiado grande (${Math.round(file.size / 1024)}KB). Máximo: 500KB`;
      input.value = ''; // Limpiar el input
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const aspectRatio = width / height;
      
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        this.logoError = 'El logo debe tener proporciones entre 0.5 y 2 (ancho/alto)';
        return;
      }
      
      // Si pasa todas las validaciones, guardar la imagen
      this.selectedLogo = file;
      this.logoPreview = reader.result as string; // Usamos el resultado del FileReader (Base64)
    };

    img.onerror = () => {
      this.logoError = 'La imagen no es válida';
    };

    reader.onload = () => {
      // Cuando el FileReader termine de leer, cargamos la imagen para validar dimensiones
      img.src = reader.result as string;
    };

    reader.onerror = () => {
      this.logoError = 'Error al leer la imagen';
    };

    // Iniciamos la lectura del archivo como Data URL (Base64)
    reader.readAsDataURL(file);
  }
}

  removeLogo(): void {
  this.selectedLogo = null;
  this.logoPreview = null;
  this.logoError = null;
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
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

  // Validar que el logo esté presente si es requerido
  if (this.isLogoRequired && !this.logoPreview) {
    this.notificationService.showError('El logo del equipo es obligatorio');
    return;
  }

  this.isLoading = true;
  
  const logoUrl = typeof this.logoPreview === 'string' 
    ? this.logoPreview 
    : this.logoPreview?.toString() || '';

  // Si el logo es requerido y no hay URL, mostrar error
  if (this.isLogoRequired && !logoUrl) {
    this.notificationService.showError('El logo del equipo es obligatorio');
    this.isLoading = false;
    return;
  }

  const teamToRegister: Team = {
    ...this.data.team,
    logo: logoUrl || 'assets/default-team-logo.png'
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

getRoleClass(role: string): string {
  if (!role) return '';
  return 'role-' +
    role
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+$/g, '')
      .trim();
}




  onCancel(): void {
    this.dialogRef.close();
  }
}
