import { TeamPlayer } from '../../admin/models/equipos.model';
import { PlayerDivision } from '../../admin/models/jugador.model';

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  originalTeamId: string;
  name: string;
  captainId: string;
  players: TournamentPlayer[];
  division: PlayerDivision;
  createdAt: Date;
  isActive: boolean;
  icon?: string;
  logo?: string;
  stats?: {
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
  };
}

export interface TournamentPlayer {
  uid: string;
  nick: string;
  role: string;
  avatar: string;
  mmr: number;
  medalImage: string;
  idDota?: number;
}