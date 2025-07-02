import { PlayerDivision } from "./jugador.model";

export interface Challenge {
    id?: string;
    fromTeamId: string;
    fromTeamName: string;
    toTeamId: string;
    toTeamName: string;
    status: 'pending' | 'accepted' | 'rejected' | 'canceled';
    createdAt: Date;
    division: PlayerDivision;
    fromTeamCaptainId: string;
    toTeamCaptainId: string;
}