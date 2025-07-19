import { Component } from '@angular/core';
import { TournamentFormat } from './models/tournament-format.enum';
import { Match } from './models/match.model';
import { TournamentTeam } from './models/team.model';
import { TournamentService } from './services/tournament.service';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css']
})
export class TournamentComponent {
selectedTeamCount: number = 8;
  format: TournamentFormat = TournamentFormat.SINGLE_ELIMINATION;
  matches: Match[] = [];
  teams: TournamentTeam[] = [];
  rounds: number[] = [];
  champion?: TournamentTeam;

  constructor(private tournamentService: TournamentService) {}

  async ngOnInit() {
    await this.generateBracket();
  }

  async generateBracket() {
    this.teams = await this.tournamentService.getTeams(this.selectedTeamCount);
    this.matches = this.tournamentService.generateSingleEliminationBracket(this.teams);
    const totalRounds = Math.max(...this.matches.map(m => m.round));
    this.rounds = Array.from({length: totalRounds}, (_, i) => i + 1);
    this.champion = undefined;
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
    
    // Simulate a BO3 match (BO5 for finals)
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
    
    // Update team stats
    if (match.winner === match.team1) {
      match.team1.stats!.wins++;
      match.team2!.stats!.losses++;
    } else {
      match.team2!.stats!.wins++;
      match.team1.stats!.losses++;
    }
    
    // Update next matches
    this.updateNextMatches(match);
    
    // Check for champion
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
