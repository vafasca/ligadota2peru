import { Component, HostListener, Input } from '@angular/core';
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

  // Zoom functionality
  zoom: number = 1;
  minZoom: number = 0.5;
  maxZoom: number = 2;
  zoomStep: number = 0.1;

  // Drag scrolling variables
  public isDragging = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;

  constructor(
    private tournamentService: TournamentService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    if (!this.tournamentId) {
      this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || undefined;
    }
    
    this.generateEmptyBracket();
    
    if (this.tournamentId) {
      await this.loadTournamentTeams();
      this.generateBracket();
    } else {
      this.isLoading = false;
    }
  }

  // Zoom methods
  zoomIn(): void {
    this.zoom = Math.min(this.zoom + this.zoomStep, this.maxZoom);
  }

  zoomOut(): void {
    this.zoom = Math.max(this.zoom - this.zoomStep, this.minZoom);
  }

  resetZoom(): void {
    this.zoom = 1;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      this.zoom = Math.min(Math.max(this.zoom + delta, this.minZoom), this.maxZoom);
    }
  }

  // Drag scrolling methods
  onMouseDown(event: MouseEvent): void {
  const bracketContainer = document.querySelector('.bracket-container') as HTMLElement;
  this.isDragging = true;
  this.startX = event.pageX - bracketContainer.offsetLeft;
  this.startY = event.pageY - bracketContainer.offsetTop;
  this.scrollLeft = bracketContainer.scrollLeft;
  this.scrollTop = bracketContainer.scrollTop;
  
  bracketContainer.style.cursor = 'grabbing';
  bracketContainer.style.userSelect = 'none';
}

  onMouseMove(event: MouseEvent): void {
  if (!this.isDragging) return;
  
  const bracketContainer = document.querySelector('.bracket-container') as HTMLElement;
  const x = event.pageX - bracketContainer.offsetLeft;
  const y = event.pageY - bracketContainer.offsetTop;
  const walkX = (x - this.startX) * 3; // Aumentamos la sensibilidad
  const walkY = (y - this.startY) * 3;
  
  bracketContainer.scrollLeft = this.scrollLeft - walkX;
  bracketContainer.scrollTop = this.scrollTop - walkY;
}

  onMouseUp(event: MouseEvent): void {
  this.isDragging = false;
  const bracketContainer = document.querySelector('.bracket-container') as HTMLElement;
  bracketContainer.style.cursor = 'grab';
  bracketContainer.style.removeProperty('user-select');
}

  onMouseLeave(): void {
  if (this.isDragging) {
    this.isDragging = false;
    const bracketContainer = document.querySelector('.bracket-container') as HTMLElement;
    bracketContainer.style.cursor = 'grab';
    bracketContainer.style.removeProperty('user-select');
  }
}

  generateEmptyBracket() {
    console.log('Max Teams:', this.maxTeams);
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
    
    for (let i = 0; i < firstRoundMatches; i++) {
      matches.push({
        id: `round-1-match-${i}`,
        round: 1,
        team1: this.createEmptyTeam(),
        team2: this.createEmptyTeam(),
        isCompleted: false
      });
    }
    
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
    const teamIcons = ['🛡️', '⚔️', '🏹', '🔮', '⚡', '🐉', '👑', '🗡️', '🛡️', '⚖️'];
    const randomIcon = teamIcons[Math.floor(Math.random() * teamIcons.length)];
    
    return {
        id: 'empty-' + Math.random().toString(36).substr(2, 9),
        name: 'TBD',
        icon: randomIcon,
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
        
        this.teams.sort((a, b) => {
            const aMMR = a.players.reduce((sum, p) => sum + (p.mmr || 0), 0);
            const bMMR = b.players.reduce((sum, p) => sum + (p.mmr || 0), 0);
            return bMMR - aMMR;
        });
        
        this.generateBracket();
    } catch (error) {
        console.error('Error loading tournament teams:', error);
        this.generateBracket();
    } finally {
        this.isLoading = false;
    }
  }

  generateBracket() {
    const teamCount = this.getNearestPowerOfTwo(this.maxTeams || 8);
    const teamsForBracket: TournamentTeam[] = [];
    
    for (let i = 0; i < this.teams.length && i < teamCount; i++) {
        teamsForBracket.push(this.teams[i]);
    }
    
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
    
    if (round === totalRounds) return 'GRAND FINAL';
    if (round === totalRounds - 1) return 'SEMIFINAL';
    if (round === totalRounds - 2) return 'QUARTERFINAL';
    if (round === totalRounds - 3) return 'ROUND OF 16';
    return `ROUND ${round}`;
  }

  simulateMatch(match: Match): void {
    if (!match.team1 || !match.team2 || match.isCompleted) return;
    
    if (match.team1.name === 'TBD' || match.team2.name === 'TBD') return;
    
    const isFinal = match.round === this.rounds.length;
    const gamesToWin = isFinal ? 3 : 2;
    
    let score1 = 0;
    let score2 = 0;
    
    const team1Strength = match.team1.players.reduce((sum, p) => sum + (p.mmr || 1000), 0) / match.team1.players.length;
    const team2Strength = match.team2.players.reduce((sum, p) => sum + (p.mmr || 1000), 0) / match.team2.players.length;
    
    while (score1 < gamesToWin && score2 < gamesToWin) {
      const totalStrength = team1Strength + team2Strength;
      const team1WinChance = team1Strength / totalStrength;
      
      if (Math.random() < team1WinChance) {
        score1++;
      } else {
        score2++;
      }
    }
    
    match.score1 = score1;
    match.score2 = score2;
    match.winner = score1 > score2 ? match.team1 : match.team2;
    match.isCompleted = true;
    
    if (match.winner === match.team1) {
      match.team1.stats!.wins++;
      match.team2!.stats!.losses++;
      match.team1.stats!.pointsFor += score1;
      match.team1.stats!.pointsAgainst += score2;
      match.team2!.stats!.pointsFor += score2;
      match.team2!.stats!.pointsAgainst += score1;
    } else {
      match.team2!.stats!.wins++;
      match.team1.stats!.losses++;
      match.team2!.stats!.pointsFor += score2;
      match.team2!.stats!.pointsAgainst += score1;
      match.team1.stats!.pointsFor += score1;
      match.team1.stats!.pointsAgainst += score2;
    }
    
    this.updateNextMatches(match);
    
    if (isFinal) {
      this.champion = match.winner;
    }
  }

  randomizeAllMatches() {
    this.matches.forEach(match => {
      match.winner = undefined;
      match.score1 = undefined;
      match.score2 = undefined;
      match.isCompleted = false;
      
      if (match.team1?.stats) {
        match.team1.stats.wins = 0;
        match.team1.stats.losses = 0;
        match.team1.stats.pointsFor = 0;
        match.team1.stats.pointsAgainst = 0;
      }
      if (match.team2?.stats) {
        match.team2.stats.wins = 0;
        match.team2.stats.losses = 0;
        match.team2.stats.pointsFor = 0;
        match.team2.stats.pointsAgainst = 0;
      }
    });
    
    this.champion = undefined;
    this.simulateRoundByRound(1);
  }

  private simulateRoundByRound(round: number) {
    if (round > this.rounds.length) return;
    
    const roundMatches = this.getMatchesForRound(round);
    let completedMatches = 0;
    
    roundMatches.forEach((match, index) => {
      setTimeout(() => {
        if (match.team1 && match.team2 && match.team1.name !== 'TBD' && match.team2.name !== 'TBD') {
          this.simulateMatch(match);
        }
        completedMatches++;
        
        if (completedMatches === roundMatches.length) {
          setTimeout(() => {
            this.simulateRoundByRound(round + 1);
          }, 500);
        }
      }, index * 300);
    });
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
    
    if (nextMatch) {
      if (matchPosition % 2 === 0) {
        nextMatch.team1 = completedMatch.winner;
      } else {
        nextMatch.team2 = completedMatch.winner;
      }
    }
  }
}
