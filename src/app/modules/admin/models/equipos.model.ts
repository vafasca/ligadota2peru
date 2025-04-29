import { Player } from "./jugador.model";

export interface Team {
    id: number;
    name: string;
    members: Player[];
    captain?: Player | null;
}