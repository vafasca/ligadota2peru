import { Component, Inject } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';
import { TournamentRegisterService } from 'src/app/modules/main-menu/services/tournament-register.service';
import { TournamentTeam } from 'src/app/modules/tournament/models/team.model';

@Component({
  selector: 'app-tournament-config-dialog',
  templateUrl: './tournament-config-dialog.component.html',
  styleUrls: ['./tournament-config-dialog.component.css']
})
export class TournamentConfigDialogComponent {
  pendingTeams: TournamentTeam[] = [];
  approvedTeams: TournamentTeam[] = [];
  selectedTab: 'pending' | 'approved' = 'pending';
  firstRoundMatches: { teamA: string, teamB: string }[] = [];
  matchFormat: 'manual' | 'random' = 'random';
  
  // Para selección manual
  selectedTeams: string[] = [];
  manualMatchInProgress: { teamA: string | null, teamB: string | null } = { teamA: null, teamB: null };
  usedTeams: Set<string> = new Set(); // Para trackear equipos ya usados

  get selectedTabIndex(): number {
    return this.selectedTab === 'pending' ? 0 : 1;
  }

  set selectedTabIndex(value: number) {
    this.selectedTab = value === 0 ? 'pending' : 'approved';
  }

  constructor(
    public dialogRef: MatDialogRef<TournamentConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tournament: Tournament },
    private tournamentService: TournamentRegisterService,
    private snackBar: MatSnackBar,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    await this.loadInitialData();
    this.loadTeams();
  }

  async loadInitialData() {
    // Cargar enfrentamientos existentes desde Firebase
    if (this.data.tournament.id) {
      const bracketRef = doc(this.firestore, `tournament_brackets/${this.data.tournament.id}`);
      const bracketSnap = await getDoc(bracketRef);
      
      if (bracketSnap.exists()) {
        const bracketData = bracketSnap.data();
        if (bracketData['rounds'] && bracketData['rounds']['1']) {
          this.firstRoundMatches = bracketData['rounds']['1'].map((match: any) => ({
            teamA: match.teamA,
            teamB: match.teamB
          }));
          
          // Marcar equipos ya usados
          this.firstRoundMatches.forEach(match => {
            this.usedTeams.add(match.teamA);
            this.usedTeams.add(match.teamB);
          });
        }
      }
    }
  }

  loadTeams(): void {
    const tournamentId = this.data.tournament.id;
    if (!tournamentId) {
      console.error('Tournament ID is undefined');
      return;
    }

    this.tournamentService.getPendingTeams(tournamentId).subscribe(teams => {
      this.pendingTeams = teams;
    });
    
    this.tournamentService.getApprovedTeams(tournamentId).subscribe(teams => {
      this.approvedTeams = teams;
    });
  }

  calculateTotalMMR(team: TournamentTeam): number {
    return team.players.reduce((sum, player) => sum + (player.mmr || 0), 0);
  }

  getTeamById(teamId: string): TournamentTeam | undefined {
    return this.approvedTeams.find(team => team.id === teamId);
  }

  approveTeam(teamId: string): void {
    const tournamentId = this.data.tournament.id;
    const team = this.pendingTeams.find(t => t.id === teamId);
    
    if (!tournamentId || !team || !team.originalTeamId) {
      console.error('Missing required data for approval');
      return;
    }

    this.tournamentService.approveTeamRegistration(
      teamId, 
      tournamentId,
      team.originalTeamId
    ).subscribe({
      next: () => {
        this.loadTeams();
        this.snackBar.open('Equipo aprobado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error approving team:', err);
        this.snackBar.open('Error al aprobar equipo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  rejectTeam(teamId: string): void {
    this.tournamentService.rejectTeamRegistration(teamId).subscribe({
      next: () => {
        this.loadTeams();
        this.snackBar.open('Equipo rechazado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error rejecting team:', err);
        this.snackBar.open('Error al rechazar equipo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  generateFirstRound(): void {
    if (this.matchFormat === 'random') {
      this.generateRandomMatches();
    } else {
      this.firstRoundMatches = []; // Reset para modo manual
    }
  }

  generateRandomMatches(): void {
    if (this.approvedTeams.length < 2) {
      this.snackBar.open('Se necesitan al menos 2 equipos para generar enfrentamientos', 'Cerrar', { duration: 3000 });
      return;
    }

    const shuffled = [...this.approvedTeams].sort(() => 0.5 - Math.random());
    this.firstRoundMatches = [];
    
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length && shuffled[i].id && shuffled[i+1].id) {
        this.firstRoundMatches.push({
          teamA: shuffled[i].id!,
          teamB: shuffled[i+1].id!
        });
      }
    }
    
    this.snackBar.open('Enfrentamientos generados aleatoriamente', 'Cerrar', { duration: 3000 });
  }

  // Métodos para selección manual
  toggleTeamSelection(teamId: string): void {
    if (this.isTeamUsed(teamId)) return;
    
    if (this.selectedTeams.includes(teamId)) {
      this.selectedTeams = this.selectedTeams.filter(id => id !== teamId);
    } else {
      if (this.selectedTeams.length < 2) {
        this.selectedTeams.push(teamId);
      } else {
        this.snackBar.open('Solo puedes seleccionar 2 equipos a la vez', 'Cerrar', { duration: 3000 });
      }
    }
    
    // Si tenemos 2 equipos seleccionados, preparamos el enfrentamiento
    if (this.selectedTeams.length === 2) {
      this.manualMatchInProgress = {
        teamA: this.selectedTeams[0],
        teamB: this.selectedTeams[1]
      };
    } else {
      this.manualMatchInProgress = { teamA: null, teamB: null };
    }
  }

  isTeamSelected(teamId: string): boolean {
    return this.selectedTeams.includes(teamId);
  }

  isTeamUsed(teamId: string): boolean {
    return this.usedTeams.has(teamId);
  }

  addManualMatch(): void {
    if (this.manualMatchInProgress.teamA && this.manualMatchInProgress.teamB) {
      // Verificar que no exista ya este enfrentamiento
      const exists = this.firstRoundMatches.some(match => 
        (match.teamA === this.manualMatchInProgress.teamA && match.teamB === this.manualMatchInProgress.teamB) ||
        (match.teamA === this.manualMatchInProgress.teamB && match.teamB === this.manualMatchInProgress.teamA)
      );
      
      if (exists) {
        this.snackBar.open('Este enfrentamiento ya existe', 'Cerrar', { duration: 3000 });
        return;
      }
      
      this.firstRoundMatches.push({
        teamA: this.manualMatchInProgress.teamA,
        teamB: this.manualMatchInProgress.teamB
      });
      
      // Marcar equipos como usados
      this.usedTeams.add(this.manualMatchInProgress.teamA);
      this.usedTeams.add(this.manualMatchInProgress.teamB);
      
      this.selectedTeams = [];
      this.manualMatchInProgress = { teamA: null, teamB: null };
      this.snackBar.open('Enfrentamiento agregado', 'Cerrar', { duration: 3000 });
    }
  }

  removeMatch(index: number): void {
    const match = this.firstRoundMatches[index];
    // Liberar equipos para poder ser seleccionados nuevamente
    this.usedTeams.delete(match.teamA);
    this.usedTeams.delete(match.teamB);
    
    this.firstRoundMatches.splice(index, 1);
    this.snackBar.open('Enfrentamiento eliminado', 'Cerrar', { duration: 3000 });
  }

  cancelManualSelection(): void {
    this.selectedTeams = [];
    this.manualMatchInProgress = { teamA: null, teamB: null };
  }

  // Para modo aleatorio
  removeRandomMatch(index: number): void {
    const match = this.firstRoundMatches[index];
    // No liberamos equipos en modo aleatorio para mantener consistencia
    this.firstRoundMatches.splice(index, 1);
    this.snackBar.open('Enfrentamiento eliminado', 'Cerrar', { duration: 3000 });
  }

  saveConfiguration(): void {
    if (this.firstRoundMatches.length === 0 && this.approvedTeams.length > 1) {
      this.snackBar.open('Debes generar al menos un enfrentamiento', 'Cerrar', { duration: 3000 });
      return;
    }

    this.tournamentService.generateBracket(
      this.data.tournament,
      this.firstRoundMatches
    ).subscribe({
      next: () => {
        this.snackBar.open('Configuración guardada correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error saving bracket:', err);
        this.snackBar.open('Error al guardar la configuración', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
