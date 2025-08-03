export interface Notification {
    id?: string;
  userId: string;
  title: string;
  message: string;
  description?: string;
  type: 'challenge' | 'system' | 'tournament_invitation';
  challengeId?: string;
  tournamentId?: string;
  teamId?: string;
  read: boolean;
  createdAt: Date;
}