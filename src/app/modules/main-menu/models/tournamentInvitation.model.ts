export interface TournamentInvitation {
  id?: string;
  tournamentId: string;
  teamId: string;
  captainId: string;
  playerId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}