import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TournamentRegisterService } from '../../services/tournament-register.service';
import { NotificationService } from 'src/app/shared-services/notification.service';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-tournament-invitation-dialog',
  templateUrl: './tournament-invitation-dialog.component.html',
  styleUrls: ['./tournament-invitation-dialog.component.css']
})
export class TournamentInvitationDialogComponent {
isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<TournamentInvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      invitationId: string,
      tournamentName: string,
      teamName: string,
      notificationId?: string // Añade este campo
    },
    private tournamentService: TournamentRegisterService,
    private notificationService: NotificationService,
    private firestore: Firestore
  ) {}

  respondToInvitation(accept: boolean): void {
    this.isLoading = true;
    
    // Actualizar primero la invitación en tournament_invitations
    const invitationRef = doc(this.firestore, `tournament_invitations/${this.data.invitationId}`);
    
    updateDoc(invitationRef, { 
      status: accept ? 'accepted' : 'rejected',
      respondedAt: new Date(),
      'notification.read': true // Marcar la notificación como leída
    }).then(() => {
      // Si tenemos un ID de notificación separado, marcarlo como leído
      if (this.data.notificationId) {
        this.notificationService.markAsRead(this.data.notificationId).subscribe({
          next: () => this.handleResponseComplete(accept),
          error: (err) => {
            console.error('Error marking notification:', err);
            this.handleResponseComplete(accept);
          }
        });
      } else {
        this.handleResponseComplete(accept);
      }
    }).catch(error => {
      console.error('Error responding to invitation:', error);
      this.notificationService.showError('Error al responder a la invitación');
      this.isLoading = false;
    });
  }

  private handleResponseComplete(accepted: boolean): void {
    this.notificationService.showSuccess(
      accepted ? 'Invitación aceptada' : 'Invitación rechazada'
    );
    this.isLoading = false;
    this.dialogRef.close(true);
  }
}
