import { TournamentFormat } from "../../tournament/models/tournament-format.enum";

export interface Tournament {
  id?: string; // Opcional porque se asigna al crear
  name: string;
  game: string;
  format: TournamentFormat;
  maxTeams: number;
  currentTeams: number;
  startDate: Date | string;
  endDate?: Date | string;
  registrationStartDate: Date | string;
  registrationEndDate: Date | string;
  prizePool?: string;
  entryFee: number;
  rules?: string;
  status: TournamentStatus;
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  teams?: string[];
  isRegistrationOpen?: boolean;
  bannerImage?: string;
  matchFormat: 'BO1' | 'BO3' | 'BO5';
  finalMatchFormat: 'BO1' | 'BO3' | 'BO5';
}

export type TournamentStatus = 'Programado' | 'En progreso' | 'Finalizado' | 'Cancelado';

export function isRegistrationOpen(tournament: Tournament): boolean {
  const now = new Date();
  const start = new Date(tournament.registrationStartDate);
  const end = new Date(tournament.registrationEndDate);
  
  return tournament.status === 'Programado' && 
         now >= start && 
         now <= end &&
         (tournament.currentTeams < tournament.maxTeams);
}