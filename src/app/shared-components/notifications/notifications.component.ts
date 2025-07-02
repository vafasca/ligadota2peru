import { Component, OnInit } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { ChallengeService } from 'src/app/modules/user/services/challenge.service';
import { NotificationService } from 'src/app/shared-services/notification.service';
import { ChallengeResponseDialogComponent } from '../challenge-response-dialog/challenge-response-dialog.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {
notifications: any[] = [];
  hasUnread = false;
  private currentUserId: string | null = null;

  constructor(
    private notificationService: NotificationService,
    private challengeService: ChallengeService,
    private auth: Auth,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.loadNotifications();
      }
    });
  }

  loadNotifications(): void {
    if (!this.currentUserId) return;

    this.notificationService.getNotifications(this.currentUserId).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.hasUnread = notifications.length > 0;
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  handleNotificationClick(notification: any): void {
    if (notification.type === 'challenge' && notification.challengeId) {
      this.openChallengeDialog(notification);
    } else {
      this.markAsRead(notification.id);
    }
  }

  openChallengeDialog(notification: any): void {
    const dialogRef = this.dialog.open(ChallengeResponseDialogComponent, {
      width: '500px',
      data: {
        challengeId: notification.challengeId,
        message: notification.message
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.markAsRead(notification.id);
      }
    });
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error('Error marking as read:', err)
    });
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      this.markAsRead(notification.id);
    });
  }
}
