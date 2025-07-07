// team.model.ts

import { PlayerDivision } from "./jugador.model";

export interface TeamPlayer {
  uid: string;
  role: string;
  avatar: string;
  mmr: number;
  nick: string;
  idDota?: number;
  medalImage: string;
}

export interface Team {
  id: string;
  name: string;
  captainId: string;
  players: TeamPlayer[];
  category: string;
  createdAt: Date;
  logo?: string;
  description?: string;
  status: TeamAvailability;
  division?: PlayerDivision;
}

export enum TeamAvailability {
  Active = 'active',
  Inactive = 'inactive',
  Disbanded = 'disbanded',
  InGame = 'in_game'
}