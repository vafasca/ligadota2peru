import { TournamentTeam } from './team.model';

export interface Match {
  id: string;
  round: number;
  team1?: TournamentTeam;
  team2?: TournamentTeam;
  score1?: number;
  score2?: number;
  winner?: TournamentTeam;
  isCompleted: boolean;
}