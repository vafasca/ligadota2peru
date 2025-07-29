import { Component, Input } from '@angular/core';
import { TournamentFormat } from '../../models/tournament-format.enum';
import { Match } from '../../models/match.model';
import { TournamentTeam } from '../../models/team.model';
import { TournamentService } from '../../services/tournament.service';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private tournamentService: TournamentService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    if (!this.tournamentId) {
      this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || undefined;
    }

    if (this.tournamentId) {
      await this.loadTournamentTeams();
      this.generateBracket();
    } else {
      console.error('No se proporcionó ID de torneo');
    }
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
    } catch (error) {
      console.error('Error loading tournament teams:', error);
    } finally {
      this.isLoading = false;
    }
  }

  generateBracket() {
    if (this.teams.length < 2) {
      console.error('Se necesitan al menos 2 equipos para generar un bracket');
      return;
    }

    // Asegurarse de que el número de equipos sea potencia de 2
    const teamCount = this.getNearestPowerOfTwo(this.teams.length);
    const teamsForBracket = [...this.teams].slice(0, teamCount);

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
      matches.push({
        id: `round-1-match-${i}`,
        round: 1,
        team1: teams[i * 2],
        team2: teams[i * 2 + 1],
        isCompleted: false
      });
    }
    
    // Generar rondas posteriores
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          id: `round-${round}-match-${i}`,
          round,
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
