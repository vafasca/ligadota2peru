import { PlayerRole } from "./jugador.model";

export interface PlayerStats {
    playerId: string;
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    favoriteHeroes: HeroStats[];
    averageKDA: {
        kills: number;
        deaths: number;
        assists: number;
    };
    mmrHistory: MMRRecord[];
    rolePerformance: RoleStats[];
}

export interface HeroStats {
    heroId: number;
    matches: number;
    wins: number;
    winRate: number;
    averageKDA: string;
}

export interface MMRRecord {
    date: Date;
    mmr: number;
    change: number;
}

export interface RoleStats {
    role: PlayerRole;
    matches: number;
    wins: number;
    winRate: number;
    averageRating: number;
}