import { TeamPlayer } from '../../admin/models/equipos.model';

export interface TournamentTeam {
  id: string;
  name: string;
  seed?: number;
  stats?: {
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
  };
  icon?: string;
  players?: TeamPlayer[]; // Opcional: incluir jugadores
}