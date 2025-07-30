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
}

export type TournamentStatus = 'Programado' | 'En progreso' | 'Finalizado' | 'Cancelado';