export interface Invitation {
    id: string;
    teamId: string;
    teamName: string;
    captainId: string;
    captainName: string;
    playerId: string;
    role: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
  }