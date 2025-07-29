import { Component, Input } from '@angular/core';
import { TournamentFormat } from '../../models/tournament-format.enum';
import { Match } from '../../models/match.model';
import { TournamentTeam } from '../../models/team.model';
import { TournamentService } from '../../services/tournament.service';
import { ActivatedRoute } from '@angular/router';
import { PlayerDivision } from 'src/app/modules/admin/models/jugador.model';

@Component({
  selector: 'app-single-elimination',
  templateUrl: './single-elimination.component.html',
  styleUrls: ['./single-elimination.component.css']
})
export class SingleEliminationComponent {
  @Input() tournamentId?: string;
  selectedTeamCount: number = 8;
  format: TournamentFormat = TournamentFormat.SINGLE_ELIMINATION;
  matches: Match[] = [];
  teams: TournamentTeam[] = [];
  rounds: number[] = [];
  champion?: TournamentTeam;
  isLoading = true;
  @Input() maxTeams?: number;

  constructor(
    private tournamentService: TournamentService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    if (!this.tournamentId) {
      this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || undefined;
    }
    console.log('Tournament ID:', this.tournamentId);
    // Generar bracket vacío basado en maxTeams
    this.generateEmptyBracket();
    
    if (this.tournamentId) {
      await this.loadTournamentTeams();
      this.generateBracket();
    } else {
      console.error('No se proporcionó ID de torneo');
      this.isLoading = false;
    }
  }

  generateEmptyBracket() {
    console.log('this.maxTeams:', this.maxTeams);
    const teamCount = this.getNearestPowerOfTwo(this.maxTeams || 8);
    this.selectedTeamCount = teamCount;
    this.matches = this.generateEmptySingleEliminationBracket(teamCount);
    const totalRounds = Math.max(...this.matches.map(m => m.round));
    this.rounds = Array.from({length: totalRounds}, (_, i) => i + 1);
  }

  private generateEmptySingleEliminationBracket(teamCount: number): Match[] {
    const matches: Match[] = [];
    const totalRounds = Math.ceil(Math.log2(teamCount));
    const firstRoundMatches = teamCount / 2;
    
    // Generar partidas vacías de la primera ronda
    for (let i = 0; i < firstRoundMatches; i++) {
      matches.push({
        id: `round-1-match-${i}`,
        round: 1,
        team1: this.createEmptyTeam(),
        team2: this.createEmptyTeam(),
        isCompleted: false
      });
    }
    
    // Generar rondas posteriores vacías
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          id: `round-${round}-match-${i}`,
          round,
          team1: this.createEmptyTeam(),
          team2: this.createEmptyTeam(),
          isCompleted: false
        });
      }
    }
    
    return matches;
  }

  private createEmptyTeam(): TournamentTeam {
    return {
        id: 'empty-' + Math.random().toString(36).substr(2, 9),
        name: 'TBD',
        icon: '❓',
        players: [],
        division: PlayerDivision.PorDefinir,
        tournamentId: this.tournamentId || '',
        originalTeamId: '',
        captainId: '',
        isActive: false,
        createdAt: new Date(),
        stats: {
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0
        }
    };
}

  async loadTournamentTeams() {
    this.isLoading = true;
    try {
        this.teams = await this.tournamentService.getTournamentTeams(this.tournamentId!);
        // Ordenar equipos por MMR total o algún criterio para el seeding
        this.teams.sort((a, b) => {
            const aMMR = a.players.reduce((sum, p) => sum + (p.mmr || 0), 0);
            const bMMR = b.players.reduce((sum, p) => sum + (p.mmr || 0), 0);
            return bMMR - aMMR;
        });
        
        // Generar el bracket con los equipos cargados
        this.generateBracket();
    } catch (error) {
        console.error('Error loading tournament teams:', error);
        // Generar bracket vacío incluso si hay error
        this.generateBracket();
    } finally {
        this.isLoading = false;
    }
}

  generateBracket() {
    // Siempre genera el bracket basado en maxTeams, incluso si no hay equipos
    const teamCount = this.getNearestPowerOfTwo(this.maxTeams || 8);
    
    // Crear un array de equipos que combine los reales con los vacíos
    const teamsForBracket: TournamentTeam[] = [];
    
    // Agregar equipos reales primero
    for (let i = 0; i < this.teams.length && i < teamCount; i++) {
        teamsForBracket.push(this.teams[i]);
    }
    
    // Completar con equipos vacíos si es necesario
    while (teamsForBracket.length < teamCount) {
        teamsForBracket.push(this.createEmptyTeam());
    }
    
    this.matches = this.generateSingleEliminationBracket(teamsForBracket);
    const totalRounds = Math.max(...this.matches.map(m => m.round));
    this.rounds = Array.from({length: totalRounds}, (_, i) => i + 1);
    this.champion = undefined;
}

  private getNearestPowerOfTwo(num: number): number {
    return Math.pow(2, Math.ceil(Math.log2(num)));
  }

  private generateSingleEliminationBracket(teams: TournamentTeam[]): Match[] {
    const matches: Match[] = [];
    const totalTeams = teams.length;
    const totalRounds = Math.ceil(Math.log2(totalTeams));
    const firstRoundMatches = totalTeams / 2;
    
    // Generar partidas de la primera ronda
    for (let i = 0; i < firstRoundMatches; i++) {
        const team1 = teams[i * 2] || this.createEmptyTeam();
        const team2 = teams[i * 2 + 1] || this.createEmptyTeam();
        
        matches.push({
            id: `round-1-match-${i}`,
            round: 1,
            team1: team1,
            team2: team2,
            isCompleted: false
        });
    }
    
    // Generar rondas posteriores con equipos vacíos
    for (let round = 2; round <= totalRounds; round++) {
        const matchesInRound = Math.pow(2, totalRounds - round);
        for (let i = 0; i < matchesInRound; i++) {
            matches.push({
                id: `round-${round}-match-${i}`,
                round,
                team1: this.createEmptyTeam(),
                team2: this.createEmptyTeam(),
                isCompleted: false
            });
        }
    }
    
    return matches;
}



  getMatchesForRound(round: number): Match[] {
    return this.matches.filter(m => m.round === round);
  }

  getRoundName(round: number): string {
    const totalRounds = this.rounds.length;
    
    if (round === totalRounds) return 'FINAL';
    if (round === totalRounds - 1) return 'SEMIFINAL';
    if (round === totalRounds - 2) return 'QUARTERFINAL';
    return `ROUND ${round}`;
  }

  simulateMatch(match: Match): void {
    if (!match.team1 || !match.team2 || match.isCompleted) return;
    
    // Simular un partido BO3 (BO5 para finales)
    const isFinal = match.round === this.rounds.length;
    const gamesToWin = isFinal ? 3 : 2;
    
    let score1 = 0;
    let score2 = 0;
    
    while (score1 < gamesToWin && score2 < gamesToWin) {
      Math.random() > 0.5 ? score1++ : score2++;
    }
    
    match.score1 = score1;
    match.score2 = score2;
    match.winner = score1 > score2 ? match.team1 : match.team2;
    match.isCompleted = true;
    
    // Actualizar estadísticas de los equipos
    if (match.winner === match.team1) {
      match.team1.stats!.wins++;
      match.team2!.stats!.losses++;
    } else {
      match.team2!.stats!.wins++;
      match.team1.stats!.losses++;
    }
    
    // Actualizar partidas siguientes
    this.updateNextMatches(match);
    
    // Verificar si hay campeón
    if (isFinal) {
      this.champion = match.winner;
    }
  }

  randomizeAllMatches() {
    // Reset all matches
    this.matches.forEach(match => {
      match.winner = undefined;
      match.score1 = undefined;
      match.score2 = undefined;
      match.isCompleted = false;
    });
    this.champion = undefined;

    // Simulate all matches in order
    for (let round = 1; round <= this.rounds.length; round++) {
      const roundMatches = this.getMatchesForRound(round);
      roundMatches.forEach(match => {
        if (match.team1 && match.team2) {
          this.simulateMatch(match);
        }
      });
    }
  }

  private updateNextMatches(completedMatch: Match): void {
    const nextRound = completedMatch.round + 1;
    if (nextRound > this.rounds.length) return;
    
    const nextRoundMatches = this.getMatchesForRound(nextRound);
    const matchPosition = this.matches
      .filter(m => m.round === completedMatch.round)
      .indexOf(completedMatch);
    
    const nextMatchIndex = Math.floor(matchPosition / 2);
    const nextMatch = nextRoundMatches[nextMatchIndex];
    
    if (matchPosition % 2 === 0) {
      nextMatch.team1 = completedMatch.winner;
    } else {
      nextMatch.team2 = completedMatch.winner;
    }
  }
}
