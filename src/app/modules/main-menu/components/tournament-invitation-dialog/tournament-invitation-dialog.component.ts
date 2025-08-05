import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TournamentRegisterService } from '../../services/tournament-register.service';
import { NotificationService } from 'src/app/shared-services/notification.service';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tournament-invitation-dialog',
  templateUrl: './tournament-invitation-dialog.component.html',
  styleUrls: ['./tournament-invitation-dialog.component.css']
})
export class TournamentInvitationDialogComponent {
isLoading = false;
  animationState = 'enter';

  constructor(
    public dialogRef: MatDialogRef<TournamentInvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      invitationId: string,
      tournamentName: string,
      teamName: string,
      notificationId?: string
    },
    private tournamentService: TournamentRegisterService,
    private notificationService: NotificationService,
    private firestore: Firestore
  ) {}

  respondToInvitation(accept: boolean): void {
    this.isLoading = true;
    
    const invitationRef = doc(this.firestore, `tournament_invitations/${this.data.invitationId}`);
    
    updateDoc(invitationRef, { 
      status: accept ? 'accepted' : 'rejected',
      respondedAt: new Date(),
      'notification.read': true
    }).then(() => {
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
    this.animationState = 'exit';
    setTimeout(() => {
      this.notificationService.showSuccess(
        accepted ? 'Invitación aceptada' : 'Invitación rechazada'
      );
      this.isLoading = false;
      this.dialogRef.close(true);
    }, 300);
  }

  closeDialog(): void {
    this.animationState = 'exit';
    setTimeout(() => this.dialogRef.close(), 300);
  }
}
