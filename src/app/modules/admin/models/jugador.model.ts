// player.model.ts
import { Match } from "./match2.model";

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
  availability?: PlayerAvailability;
  rolUser: PlayerRole;
  playerDivision: PlayerDivision;
  tempVisibleDivision?: PlayerDivision;
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

export enum PlayerAvailability {
  Available = 'available',
  InTeam = 'in_team',
  Unavailable = 'unavailable'
}

export enum PlayerRole {
  Player = 'player',
  SubAdmin = 'subadmin',
  Admin = 'admin'
}

export enum PlayerDivision {
  Division1 = 'division1',
  Division2 = 'division2',
  PorDefinir = 'por_definir'
}