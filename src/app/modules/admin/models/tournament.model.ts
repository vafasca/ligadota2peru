export interface Tournament {
    id: string;
    name: string;
    organizer: string;
    startDate: Date;
    endDate: Date;
    prizePool: number;
    teams: string[]; // IDs de equipos
    matches: string[]; // IDs de partidas
    status: 'Planificado' | 'En Curso' | 'Finalizado' | 'Cancelado';
    rules: TournamentRules;
    brackets?: TournamentBracket;
    maxTeams: number;
    currentTeams: number;
}

export interface TournamentRules {
    format: 'Single Elimination' | 'Double Elimination' | 'Round Robin';
    gameMode: 'Captains Mode' | 'All Pick' | 'Custom';
    seriesLength: 'BO1' | 'BO2' | 'BO3' | 'BO5';
    mmrRange?: {
        min: number;
        max: number;
    };
}

export interface TournamentBracket {
    stages: BracketStage[];
    currentStage: number;
}

export interface BracketStage {
    name: string;
    matches: string[]; // IDs de partidas
    isCompleted: boolean;
}