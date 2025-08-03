import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';
import { TournamentService } from 'src/app/modules/tournament/services/tournament.service';
import { TournamentRegisterService } from '../../services/tournament-register.service';
import { NotificationService } from 'src/app/shared-services/notification.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { finalize, from, take } from 'rxjs';
import { Firestore, collection, query, where, onSnapshot, getDocs } from '@angular/fire/firestore';

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
  invitationSent = false;
  allAccepted = false;
  isSendingInvitations = false;
  captainId: string | null = null;
  playerResponses: {playerId: string; nick?: string; status: string}[] = [];
  private unsubscribeSnapshot: (() => void) | null = null;

  constructor(
    public dialogRef: MatDialogRef<RegisterTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team: Team },
    private tournamentService: TournamentRegisterService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.loadAvailableTournaments();
    if (this.data.team.logo) {
      this.logoPreview = this.data.team.logo;
    }
    this.captainId = this.data.team.captainId;
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'accepted': return 'check_circle';
      case 'pending': return 'schedule';
      case 'rejected': return 'cancel';
      default: return 'help';
    }
  }

  getStatusTooltip(status: string): string {
    switch(status) {
      case 'accepted': return 'Invitación aceptada';
      case 'pending': return 'Invitación pendiente';
      case 'rejected': return 'Invitación rechazada';
      default: return 'Estado desconocido';
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
  this.canRegister = false;
  this.registrationMessage = '';
  
  this.tournamentService.canRegisterToTournament(this.data.team.id, this.selectedTournament)
    .pipe(
      finalize(() => {
        this.isChecking = false;
        // Verificación adicional cuando hay invitaciones enviadas
        if (this.invitationSent && this.allAccepted && this.canRegister === false) {
          this.canRegister = true;
          this.registrationMessage = '¡PUEDES INSCRIBIRTE A ESTE TORNEO!';
        }
      })
    )
    .subscribe({
      next: (result) => {
        this.canRegister = result.canRegister;
        this.registrationMessage = result.message || '';
        
        // Si todos aceptaron pero el mensaje sigue siendo de invitaciones
        if (this.allAccepted && this.registrationMessage.includes('invitaciones')) {
          this.registrationMessage = '¡PUEDES INSCRIBIRTE A ESTE TORNEO!';
          this.canRegister = true;
        }
      },
      error: (err) => {
        this.canRegister = false;
        this.registrationMessage = 'Error al verificar requisitos';
      }
    });
}

  onTournamentSelect(): void {
    if (this.selectedTournament) {
      this.checkRegistrationStatus();
      this.checkExistingInvitations();
    }
  }

  checkExistingInvitations(): void {
    if (!this.selectedTournament || !this.data.team?.id) return;

    const q = query(
      collection(this.firestore, 'tournament_invitations'),
      where('teamId', '==', this.data.team.id),
      where('tournamentId', '==', this.selectedTournament)
    );

    from(getDocs(q)).pipe(take(1)).subscribe(snapshot => {
      this.invitationSent = !snapshot.empty;
      if (this.invitationSent) {
        this.loadPlayerResponses();
      } else {
        this.playerResponses = [];
        this.allAccepted = false;
      }
    });
  }

  // Nuevo método para enviar invitaciones
  sendInvitations(): void {
  if (!this.selectedTournament || !this.data.team?.id || this.isSendingInvitations) return;
  
  this.isSendingInvitations = true;
  
  this.tournamentService.sendTournamentInvitations(
    this.data.team.id, 
    this.selectedTournament
  ).subscribe({
    next: () => {
      this.notificationService.showSuccess('Invitaciones enviadas a jugadores pendientes');
      this.invitationSent = true;
      this.loadPlayerResponses(); // Recargar estados
      this.isSendingInvitations = false;
    },
    error: (err) => {
      console.error('Error sending invitations:', err);
      this.notificationService.showError(err.message || 'Error al enviar invitaciones');
      this.isSendingInvitations = false;
    }
  });
}

  // Método para cargar las respuestas de los jugadores
  loadPlayerResponses(): void {
  if (!this.selectedTournament || !this.data.team?.id) return;
  
  const q = query(
    collection(this.firestore, 'tournament_invitations'),
    where('teamId', '==', this.data.team.id),
    where('tournamentId', '==', this.selectedTournament)
  );

  this.unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
    this.playerResponses = [];
    let allAccepted = true;
    let allPlayersResponded = true;
    
    // Verificar cada jugador del equipo
    this.data.team.players.forEach(player => {
      // El capitán siempre está aceptado
      if (player.uid === this.captainId) {
        this.playerResponses.push({
          playerId: player.uid,
          nick: player.nick,
          status: 'accepted'
        });
        return;
      }

      // Buscar respuesta del jugador
      let playerResponse = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data['playerId'] === player.uid) {
          playerResponse = data['status'];
        }
      });

      // Si no hay respuesta, no está listo
      if (!playerResponse) {
        allAccepted = false;
        allPlayersResponded = false;
        this.playerResponses.push({
          playerId: player.uid,
          nick: player.nick,
          status: 'pending'
        });
      } else {
        this.playerResponses.push({
          playerId: player.uid,
          nick: player.nick,
          status: playerResponse
        });
        if (playerResponse !== 'accepted') {
          allAccepted = false;
        }
      }
    });

    this.allAccepted = allAccepted && allPlayersResponded;
    this.invitationSent = snapshot.size > 0;
    
    // Forzar nueva verificación cuando cambian los estados
    this.checkRegistrationStatus();
  });
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

    // Verificar que todas las invitaciones fueron aceptadas
    if (this.invitationSent && !this.allAccepted) {
      this.notificationService.showError('Todos los jugadores deben aceptar la invitación');
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

  /**
   * Returns the invitation status for a given player UID.
   * Possible return values: 'accepted', 'pending', 'rejected'.
   */
  getPlayerStatus(uid: string): 'accepted' | 'pending' | 'rejected' {
    const response = this.playerResponses.find(r => r.playerId === uid);
    return response ? (response.status as 'accepted' | 'pending' | 'rejected') : 'pending';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onPlayerChanged(): void {
  // Resetear estados cuando cambia un jugador
  this.invitationSent = false;
  this.allAccepted = false;
  this.playerResponses = [];
  
  // Volver a verificar requisitos
  if (this.selectedTournament) {
    this.checkRegistrationStatus();
  }
}

    ngOnDestroy(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
  }
}
