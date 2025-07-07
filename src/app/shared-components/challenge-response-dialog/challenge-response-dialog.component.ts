import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { switchMap } from 'rxjs';
import { ChallengeService } from 'src/app/modules/user/services/challenge.service';
import { NotificationService } from 'src/app/shared-services/notification.service';

@Component({
  selector: 'app-challenge-response-dialog',
  templateUrl: './challenge-response-dialog.component.html',
  styleUrls: ['./challenge-response-dialog.component.css']
})
export class ChallengeResponseDialogComponent {
constructor(
    public dialogRef: MatDialogRef<ChallengeResponseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      challengeId: string,
      message: string,
      fromTeamName: string,
      fromTeamDescription: string,
      toTeamId: string
    },
    private challengeService: ChallengeService,
    private notificationService: NotificationService
  ) {}

  acceptChallenge(): void {
  this.challengeService.acceptChallenge(this.data.challengeId).pipe(
    switchMap(() => {
      // Cancelar todos los demás desafíos pendientes para este equipo
      return this.challengeService.cancelOtherChallenges(this.data.toTeamId, this.data.challengeId);
    }),
    switchMap(() => {
      // Marcar todas las notificaciones de desafío como leídas
      return this.notificationService.markAllAsReadForChallenge(this.data.toTeamId);
    })
  ).subscribe({
    next: () => {
      this.dialogRef.close(true);
    },
    error: (err) => {
      console.error('Error accepting challenge:', err);
      this.dialogRef.close(false);
    }
  });
}

  rejectChallenge(): void {
    this.challengeService.rejectChallenge(this.data.challengeId).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => console.error('Error rejecting challenge:', err)
    });
  }
}
