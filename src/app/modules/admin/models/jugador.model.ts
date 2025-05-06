// player.model.ts
import { Match } from "./match.model";

export interface Player {
  uid: string;
  avatar: string;
  nick: string;
  idDota: number;
  category: string;
  mmr: number;
  medal: string;
  medalImage: string;
  status: string;
  rating: number;
  role: string;
  secondaryRole: string;
  secondaryCategory: string;
  observations?: string;
  isCaptain?: boolean;
  teamId?: string | null;
  registrationDate?: Date;
  availability?: 'available' | 'in_team' | 'unavailable'; // Nuevo campo
  socialMedia?: {
    twitch?: string;
    youtube?: string;
    kick?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    discord?: string;
    tiktok?: string;
  };
  matches?: Match[];
}