import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Team, TeamPlayer } from 'src/app/modules/admin/models/equipos.model';
import { PlayerDivision } from 'src/app/modules/admin/models/jugador.model';
import { PlayerService } from 'src/app/modules/admin/services/player.service';
import { TeamService } from 'src/app/modules/main-menu/services/team.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChallengeService } from 'src/app/modules/user/services/challenge.service';
import { NotificationService } from 'src/app/shared-services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmChallengeDialogComponent } from 'src/app/shared-components/confirm-challenge-dialog/confirm-challenge-dialog.component';
import { Challenge } from 'src/app/modules/admin/models/challenge.model';
import { Notification } from 'src/app/modules/admin/models/notification.model';

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
  currentUserTeam: Team | null = null;
  currentUserId: string | null = null;
  isCaptain = false;

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
    private snackBar: MatSnackBar,
    private challengeService: ChallengeService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCurrentUserDivision();
    this.loadTeamsRealTime();
    this.loadCurrentUserData();
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

  private loadCurrentUserData(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.playerService.getPlayer(user.uid).subscribe((player) => {
          if (player) {
            this.currentDivision = player.tempVisibleDivision || player.playerDivision;
            this.isCaptain = player.isCaptain || false;
            this.loadUserTeam(user.uid);
          }
        });
      }
    });
  }

  private loadUserTeam(playerId: string): void {
    this.teamService.getUserTeam(playerId).subscribe({
      next: (team) => {
        this.currentUserTeam = team;
      },
      error: (err) => console.error('Error loading user team:', err)
    });
  }

  canChallenge(team: Team): boolean {
    // Modo prueba: mínimo 2 jugadores para desafiar
    return this.isCaptain && 
           this.currentUserTeam !== null && 
           this.currentUserTeam.players.length >= 2 && 
           team.players.length >= 2 &&
           this.currentUserTeam.id !== team.id &&
           this.currentUserTeam.division === team.division;
  }

  challengeTeam(team: Team): void {
  console.log('challengeTeam() llamado');
  console.log('currentUserTeam:', this.currentUserTeam);
  console.log('team:', team);
  console.log('isCaptain:', this.isCaptain);

  if (!this.currentUserTeam) {
    console.warn('No tienes equipo asignado.');
    return;
  }

  if (!this.canChallenge(team)) {
    console.warn('No puedes desafiar a este equipo por estas razones:');
    console.log('Es capitán?', this.isCaptain);
    console.log('Tiene equipo?', !!this.currentUserTeam);
    console.log('Equipo propio tiene >=2 jugadores?', this.currentUserTeam.players.length >= 2);
    console.log('Equipo rival tiene >=2 jugadores?', team.players.length >= 2);
    console.log('Son equipos diferentes?', this.currentUserTeam.id !== team.id);
    console.log('Misma división?', this.currentUserTeam.division === team.division);
    return;
  }

  console.log('✅ Puedes desafiar al equipo. Abriendo diálogo...');
  const dialogRef = this.dialog.open(ConfirmChallengeDialogComponent, {
    width: '500px',
    data: { teamName: team.name }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('Resultado del diálogo:', result);
    if (result) {
      this.sendChallenge(team);
    }
  });
}

  private sendChallenge(team: Team): void {
    if (!this.currentUserTeam || !this.currentUserId) return;

    const challenge: Omit<Challenge, 'id'> = {
      fromTeamId: this.currentUserTeam.id,
      fromTeamName: this.currentUserTeam.name,
      toTeamId: team.id,
      toTeamName: team.name,
      status: 'pending',
      createdAt: new Date(),
      division: team.division as PlayerDivision,
      fromTeamCaptainId: this.currentUserId,
      toTeamCaptainId: team.captainId
    };

    this.challengeService.createChallenge(challenge).subscribe({
      next: (challengeId) => {
        // Crear notificación para el equipo desafiado
        const notification: Omit<Notification, 'id'> = {
          userId: team.captainId,
          title: 'Nuevo Desafío',
          message: `${this.currentUserTeam?.name} te ha desafiado!`,
          type: 'challenge',
          challengeId: challengeId,
          read: false,
          createdAt: new Date()
        };

        this.notificationService.createNotification(notification).subscribe({
          next: () => {
            this.snackBar.open('Desafío enviado con éxito', 'Cerrar', { duration: 3000 });
          },
          error: (err) => console.error('Error creating notification:', err)
        });
      },
      error: (err) => {
        console.error('Error creating challenge:', err);
        this.snackBar.open('Error al enviar el desafío', 'Cerrar', { duration: 3000 });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.teamSubscription) {
      this.teamSubscription.unsubscribe();
    }
  }
}
