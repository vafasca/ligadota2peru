import { Component, OnInit } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { ChallengeService } from 'src/app/modules/user/services/challenge.service';
import { NotificationService } from 'src/app/shared-services/notification.service';
import { ChallengeResponseDialogComponent } from '../challenge-response-dialog/challenge-response-dialog.component';
import { TournamentInvitationDialogComponent } from 'src/app/modules/main-menu/components/tournament-invitation-dialog/tournament-invitation-dialog.component';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { from, take } from 'rxjs';

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
    private dialog: MatDialog,
    private firestore: Firestore
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
        this.hasUnread = notifications.some(n => !n.read);
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  handleNotificationClick(notification: any): void {
    if (notification.type === 'challenge' && notification.challengeId) {
      this.openChallengeDialog(notification);
    } 
    else if (notification.type === 'tournament_invitation') {
      this.openTournamentInvitationDialog(notification);
    }
    else {
      this.markAsRead(notification.id);
    }
  }

  openChallengeDialog(notification: any): void {
    const dialogRef = this.dialog.open(ChallengeResponseDialogComponent, {
      width: '500px',
      data: {
        challengeId: notification.challengeId,
        message: notification.message,
        fromTeamName: notification.message.split(' te ha desafiado!')[0],
        fromTeamDescription: notification.description,
        toTeamId: notification.userId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.markAsRead(notification.id);
      }
    });
  }

  openTournamentInvitationDialog(notification: any): void {
  // Primero encontrar la invitación correspondiente
  const q = query(
    collection(this.firestore, 'tournament_invitations'),
    where('teamId', '==', notification.teamId),
    where('tournamentId', '==', notification.tournamentId),
    where('playerId', '==', this.currentUserId)
  );

  from(getDocs(q)).pipe(
    take(1)
  ).subscribe({
    next: (snapshot) => {
      if (snapshot.empty) {
        this.notificationService.showError('Invitación no encontrada');
        return;
      }

      const invitation = snapshot.docs[0].data();
      const dialogRef = this.dialog.open(TournamentInvitationDialogComponent, {
        width: '500px',
        data: {
          invitationId: snapshot.docs[0].id, // ID de la invitación real
          tournamentName: this.extractTournamentName(notification.message),
          teamName: this.extractTeamName(notification.message),
          notificationId: notification.id // ID de la notificación
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.markAsRead(notification.id);
          this.loadNotifications();
        }
      });
    },
    error: (err) => {
      console.error('Error finding invitation:', err);
      this.notificationService.showError('Error al procesar invitación');
    }
  });
}

  private extractTeamName(message: string): string {
    try {
      return message.split(' te invita a unirse al torneo ')[0];
    } catch (error) {
      console.error('Error extracting team name:', error);
      return 'Equipo desconocido';
    }
  }

  private extractTournamentName(message: string): string {
    try {
      return message.split(' te invita a unirse al torneo ')[1];
    } catch (error) {
      console.error('Error extracting tournament name:', error);
      return 'Torneo desconocido';
    }
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error('Error marking as read:', err)
    });
  }

  markAllAsRead(): void {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    unreadNotifications.forEach(notification => {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          // Actualizar el estado local sin recargar todas las notificaciones
          notification.read = true;
          this.hasUnread = this.notifications.some(n => !n.read);
        },
        error: (err) => console.error('Error marking as read:', err)
      });
    });
  }
}
