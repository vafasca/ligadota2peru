import { Component } from '@angular/core';
interface Team {
  name: string;
  score?: number;
}

interface Match {
  id: number;
  team1?: Team;
  team2?: Team;
  winner?: Team;
  round: number;
  position: number;
}
@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css']
})
export class TournamentComponent {
selectedTeamCount: number = 8;
  matches: Match[] = [];
  rounds: number[] = [];
  champion?: Team;

  teamNames = [
    'TG', 'Syc', 'Ascent Esports', 'TK Esports', 'Happy Happy', 'The Immortal',
    'CGRasmuss', 'Interactive.ph', 'Greenify', 'KINGS', 'NotTel', 'SKNGS',
    'CallTt', 'Artex Duelius', 'Skyline Gaming', 'Groomily', 'Team Alpha',
    'Phoenix Squad', 'Storm Riders', 'Cyber Wolves', 'Dark Knights', 'Fire Eagles',
    'Ice Warriors', 'Thunder Hawks', 'Shadow Hunters', 'Lightning Bolts',
    'Crimson Tide', 'Golden Lions', 'Silver Sharks', 'Steel Panthers',
    'Neon Dragons', 'Plasma Tigers'
  ];

  teamIcons = ['🎮', '⚡', '🔥', '💎', '🚀', '⭐', '💀', '🏆', '🎯', '🎪', '🎨', '🎭', '🎰', '🎲', '🎵', '🎸'];

  ngOnInit() {
    this.generateBracket();
  }

  generateBracket() {
    this.matches = [];
    this.champion = undefined;
    
    const totalRounds = Math.log2(this.selectedTeamCount);
    this.rounds = Array.from({length: totalRounds}, (_, i) => i + 1);
    
    // Generate first round matches
    let matchId = 1;
    const firstRoundMatches = this.selectedTeamCount / 2;
    
    for (let i = 0; i < firstRoundMatches; i++) {
      const team1 = {
        name: this.teamNames[i * 2],
        score: undefined
      };
      const team2 = {
        name: this.teamNames[i * 2 + 1],
        score: undefined
      };
      
      this.matches.push({
        id: matchId++,
        team1,
        team2,
        round: 1,
        position: i
      });
    }
    
    // Generate subsequent round matches
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        this.matches.push({
          id: matchId++,
          round,
          position: i
        });
      }
    }
  }

  getMatchesForRound(round: number): Match[] {
    return this.matches.filter(match => match.round === round);
  }

  getRoundName(roundIndex: number): string {
    const totalRounds = this.rounds.length;
    const round = roundIndex + 1;
    
    if (round === totalRounds) return 'FINAL';
    if (round === totalRounds - 1) return 'SEMIFINAL';
    if (round === totalRounds - 2) return 'QUARTERFINAL';
    return `ROUND ${round}`;
  }

  getTeamIcon(teamName?: string): string {
    if (!teamName) return '❓';
    const index = this.teamNames.indexOf(teamName);
    return this.teamIcons[index % this.teamIcons.length];
  }

  randomizeScores() {
  // Reset all matches
  this.matches.forEach(match => {
    match.winner = undefined;
    if (match.team1) match.team1.score = undefined;
    if (match.team2) match.team2.score = undefined;
  });
  this.champion = undefined;

  // Function to simulate a BO3 match
  const simulateBO3 = (team1: Team, team2: Team): {winner: Team, score1: number, score2: number} => {
    let wins1 = 0;
    let wins2 = 0;
    let score1 = 0;
    let score2 = 0;
    
    // Play games until one team gets 2 wins
    while (wins1 < 2 && wins2 < 2) {
      const gameResult = Math.random() > 0.5 ? 1 : 2;
      if (gameResult === 1) {
        wins1++;
        score1++;
      } else {
        wins2++;
        score2++;
      }
    }
    
    return {
      winner: wins1 > wins2 ? {...team1} : {...team2},
      score1: wins1,
      score2: wins2
    };
  };

  // Function to simulate a BO5 match (for final)
  const simulateBO5 = (team1: Team, team2: Team): {winner: Team, score1: number, score2: number} => {
    let wins1 = 0;
    let wins2 = 0;
    let score1 = 0;
    let score2 = 0;
    
    // Play games until one team gets 3 wins
    while (wins1 < 3 && wins2 < 3) {
      const gameResult = Math.random() > 0.5 ? 1 : 2;
      if (gameResult === 1) {
        wins1++;
        score1++;
      } else {
        wins2++;
        score2++;
      }
    }
    
    return {
      winner: wins1 > wins2 ? {...team1} : {...team2},
      score1: wins1,
      score2: wins2
    };
  };

  // Simulate first round
  const firstRoundMatches = this.getMatchesForRound(1);
  firstRoundMatches.forEach(match => {
    if (match.team1 && match.team2) {
      const result = simulateBO3(match.team1, match.team2);
      
      match.team1.score = result.score1;
      match.team2.score = result.score2;
      match.winner = result.winner;
    }
  });

  // Simulate subsequent rounds
  for (let round = 2; round <= this.rounds.length; round++) {
    const currentRoundMatches = this.getMatchesForRound(round);
    const previousRoundMatches = this.getMatchesForRound(round - 1);

    currentRoundMatches.forEach((match, index) => {
      const team1Source = previousRoundMatches[index * 2];
      const team2Source = previousRoundMatches[index * 2 + 1];

      if (team1Source?.winner && team2Source?.winner) {
        match.team1 = { ...team1Source.winner };
        match.team2 = { ...team2Source.winner };

        // Check if this is the final round (BO5)
        if (round === this.rounds.length) {
          const result = simulateBO5(match.team1, match.team2);
          match.team1.score = result.score1;
          match.team2.score = result.score2;
          match.winner = result.winner;
        } else {
          const result = simulateBO3(match.team1, match.team2);
          match.team1.score = result.score1;
          match.team2.score = result.score2;
          match.winner = result.winner;
        }
      }
    });
  }

  // Set champion
  const finalMatch = this.getMatchesForRound(this.rounds.length)[0];
  if (finalMatch?.winner) {
    this.champion = finalMatch.winner;
  }
}
}
