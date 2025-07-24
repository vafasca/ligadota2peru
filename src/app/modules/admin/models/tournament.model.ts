export interface Tournament {
  id?: string; // Opcional porque se asigna al crear
  name: string;
  game: string;
  format: 'Single Elimination' | 'Double Elimination' | 'Round Robin';
  maxTeams: number;
  currentTeams: number;
  startDate: Date | string;
  endDate?: Date | string;
  prizePool?: string;
  entryFee: number;
  rules?: string;
  status: TournamentStatus;
  createdBy: string; // ID del moderador/administrador que lo creó
  createdAt: Date | string;
  updatedAt?: Date | string;
  teams?: string[]; // IDs de los equipos participantes
}

export type TournamentStatus = 'Programado' | 'En progreso' | 'Finalizado' | 'Cancelado';