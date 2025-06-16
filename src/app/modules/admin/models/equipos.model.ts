// team.model.ts

import { PlayerDivision } from "./jugador.model";

export interface TeamPlayer {
  uid: string;
  role: string;
  avatar: string;
  mmr: number;
  nick: string; // Nuevo campo
  idDota?: number; // ID de Dota 2
  medalImage: string;
}

export interface Team {
  id: string;
  name: string;
  captainId: string; // UID del capitán
  players: TeamPlayer[]; // Aquí ahora guardamos más info del jugador
  category: string; // Tier del equipo
  createdAt: Date;
  logo?: string;
  description?: string;
  status: 'active' | 'inactive' | 'disbanded';
  division?: PlayerDivision;
}