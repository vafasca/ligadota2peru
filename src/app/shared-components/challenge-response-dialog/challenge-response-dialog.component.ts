import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
    @Inject(MAT_DIALOG_DATA) public data: any,
    private challengeService: ChallengeService,
    private notificationService: NotificationService
  ) {}

  acceptChallenge(): void {
    this.challengeService.acceptChallenge(this.data.challengeId).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => console.error('Error accepting challenge:', err)
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
