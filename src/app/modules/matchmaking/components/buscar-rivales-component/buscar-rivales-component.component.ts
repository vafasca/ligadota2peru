import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Team, TeamPlayer } from 'src/app/modules/admin/models/equipos.model';
import { PlayerDivision } from 'src/app/modules/admin/models/jugador.model';
import { PlayerService } from 'src/app/modules/admin/services/player.service';
import { TeamService } from 'src/app/modules/main-menu/services/team.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-buscar-rivales-component',
  templateUrl: './buscar-rivales-component.component.html',
  styleUrls: ['./buscar-rivales-component.component.css'],
})
export class BuscarRivalesComponentComponent {
  teams: Team[] = [];
  teamsDiv1: Team[] = [];
  teamsDiv2: Team[] = [];
  private teamSubscription!: Subscription;
  currentDivision: PlayerDivision = PlayerDivision.PorDefinir;
  activeDivision: 'div1' | 'div2' = 'div1';

  rolesOrder = [
    { key: 'Hard Support', label: 'Hard Support' },
    { key: 'Offlane', label: 'Offlane' },
    { key: 'Mid Lane', label: 'Mid Lane' },
    { key: 'Carry (Safe Lane)', label: 'Carry (Safe Lane)' },
    { key: 'Soft Support', label: 'Soft Support' },
  ];

  constructor(
    private playerService: PlayerService,
    private router: Router,
    private teamService: TeamService,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCurrentUserDivision();
    this.loadTeamsRealTime();
  }

  loadCurrentUserDivision(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.playerService.getPlayer(user.uid).subscribe((player) => {
          if (player) {
            this.currentDivision =
              player.tempVisibleDivision || player.playerDivision;
          }
        });
      }
    });
  }

  loadTeamsRealTime(): void {
    this.teamSubscription = this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teamsDiv1 = teams.filter(
          (team) => team.division === PlayerDivision.Division1
        );
        this.teamsDiv2 = teams.filter(
          (team) => team.division === PlayerDivision.Division2
        );
      },
      error: (err) => {
        console.error('Error loading teams:', err);
      },
    });
  }

  goToLobby(): void {
    this.router.navigate(['/lobby']);
  }

  viewPlayerProfile(player: TeamPlayer): void {
  if (player?.idDota) {
    // Abrir en nueva pestaña con idDota
    window.open(`/profile/${player.idDota}`, '_blank');
  } else if (player?.uid) {
    // Si no tenemos idDota pero sí UID, obtener el jugador completo
    this.playerService.getPlayer(player.uid).subscribe({
      next: (fullPlayer) => {
        if (fullPlayer?.idDota) {
          window.open(`/profile/${fullPlayer.idDota}`, '_blank');
        } else {
          console.warn('El jugador no tiene idDota registrado');
          this.showErrorMessage('No se puede ver el perfil: ID de Dota no registrado');
        }
      },
      error: (err) => {
        console.error('Error al obtener datos del jugador:', err);
        this.showErrorMessage('Error al cargar el perfil del jugador');
      }
    });
  } else {
    console.error('No hay suficiente información del jugador');
    this.showErrorMessage('No se puede ver el perfil: información insuficiente');
  }
}

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }

  goToLiveMatches(): void {
    this.router.navigate(['/live-matches']); // Cambia por tu ruta real
  }

  getMemberByRole(players: any[], role: string): any {
    if (!players || players.length === 0) return null;
    // El primer jugador en el array es el capitán
    const member = players.find((player) => player.role === role);
    if (member) {
      return {
        ...member,
        isCaptain: players[0].uid === member.uid,
      };
    }
    return null;
  }

  getTeamTotalMMR(players: TeamPlayer[]): number {
    return players.reduce((total, player) => total + (player.mmr || 0), 0);
  }

  hasRoleFilled(team: Team, role: string): boolean {
    return team.players.some((player) => player.role === role);
  }

  ngOnDestroy(): void {
    if (this.teamSubscription) {
      this.teamSubscription.unsubscribe();
    }
  }
}
