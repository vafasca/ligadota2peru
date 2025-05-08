import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, Subscription, throwError } from 'rxjs';
import { Player } from 'src/app/modules/admin/models/jugador.model';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { PlayerService } from 'src/app/modules/admin/services/player.service';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateTeamDialogComponent } from '../create-team-dialog/create-team-dialog.component';
import { AddPlayerDialogComponent } from '../add-player-dialog/add-player-dialog.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent {
  private authSubscription: Subscription = new Subscription();
  private playersSub!: Subscription;
  private teamsSub!: Subscription;
  currentUserUid: string | null = null;
  isLoading = true;
  errorMessage = '';
  availablePlayersSub!: Subscription;

  player: Player = {
    uid: '',
    avatar: '',
    nick: '',
    idDota: 0,
    category: '',
    mmr: 0,
    medal: '',
    medalImage: '',
    rating: 0,
    status: 'Activo',
    role: '',
    secondaryRole: '',
    secondaryCategory: '',
    observations: '',
    availability: 'available',
    socialMedia: {
      twitch: '',
      youtube: '',
      kick: '',
      twitter: '',
      discord: '',
      instagram: '',
      facebook: '',
      tiktok: ''
    },
    matches: []
  };

  // Variables para equipos
  userTeam: Team | null = null;
  teamPlayers: Player[] = [];
  isTeamCaptain = false;
  showTeamSection = false;
  

  // Variable para almacenar el rol temporal
  tempRole: string = '';

  availablePlayers: Player[] = [];
  categories: string[] = [];
  roles: string[] = ['Carry (Safe Lane)', 'Mid Lane', 'Offlane', 'Hard Support', 'Soft Support'];
  selectedCategory: string = 'all';
  selectedRole: string = 'all';
  filteredCategories: string[] = [];
  

  constructor(
    private router: Router,
    private auth: Auth,
    private playerService: PlayerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
    // Al iniciar, cargamos el rol temporal si existe
    //this.loadTempRole();
  }

  private loadTempRole(): void {
    const savedRole = sessionStorage.getItem('tempRole');
    if (savedRole) {
      this.tempRole = savedRole;
    } else {
      this.tempRole = this.player.role;
    }
  }

  private saveTempRole(): void {
    sessionStorage.setItem('tempRole', this.tempRole);
  }

  private clearTempRole(): void {
    sessionStorage.removeItem('tempRole');
  }

  private setupAuthListener(): void {
    this.authSubscription = new Subscription();
    
    const unsubscribe = onAuthStateChanged(this.auth, (user) => {
      console.log('[LOBBY] Auth state changed:', user ? 'Authenticated' : 'Not authenticated');
      this.currentUserUid = user?.uid || null;
      
      if (user) {
        this.loadPlayerData(user.uid);
        this.loadAvailablePlayers();
        this.loadUserTeam(user.uid);
        this.loadAvailablePlayers();
      } else {
        this.handleUnauthenticated();
      }
    });
    
    this.authSubscription.add({ unsubscribe });
  }

  private loadPlayerData(uid: string): void {
    this.isLoading = true;
    this.playerService.getPlayer(uid).subscribe({
      next: (playerData) => {
        if (playerData) {
          this.player = playerData;
          this.isTeamCaptain = playerData.isCaptain || false;
          this.isLoading = false;
        } else {
          this.errorMessage = 'Perfil no encontrado';
          this.isLoading = false;
          this.router.navigate(['/complete-profile']);
        }
      },
      error: (err) => {
        console.error('[LOBBY] Error loading player:', err);
        this.errorMessage = 'Error al cargar perfil';
        this.isLoading = false;
      }
    });
  }

  private loadUserTeam(playerId: string): void {
    this.teamsSub = this.playerService.getTeams().pipe(
      map(teams => 
        teams.find(team => team.captainId === playerId || team.players.some(p => p.uid === playerId))
      )
    ).subscribe({
      next: (userTeam) => {
        this.userTeam = userTeam || null;
        this.showTeamSection = !!this.userTeam || this.isTeamCaptain;
  
        if (this.userTeam) {
          // Suscripción en tiempo real a los jugadores del equipo
          this.loadTeamPlayersRealTime(this.userTeam.id);
        } else {
          this.teamPlayers = [];
        }
      },
      error: (err) => {
        console.error('[LOBBY] Error loading teams:', err);
      }
    });
  }

  
  onDrop(event: CdkDragDrop<Player[]>) {
    console.log('Evento completo:', event);
    console.log('Datos del contenedor anterior:', event.previousContainer.data);
    console.log('Datos del contenedor actual:', event.container.data);
    
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const player = event.item.data;
      if (!player) return;
      
      const newRole = event.container.id; 
      this.updatePlayerRole(player.uid, newRole).subscribe({
        next: () => {
          console.log(`Player role updated to ${newRole}`);
        },
        error: (err) => {
          console.error('Error updating player role:', err);
        }
      });
    }
  }
  
  // Método auxiliar para verificar si hay jugadores en un rol
  hasPlayerInRole(role: string): boolean {
    return this.teamPlayers.some(p => p.role === role);
  }

  updatePlayerRole(playerUid: string, newRole: string): Observable<void> {
    if (!this.userTeam) {
      return throwError(() => new Error('Sin equipo'));
    }
    
    return this.playerService.updatePlayerRole(
      this.userTeam.id, 
      playerUid, 
      newRole
    );
  }


  private loadTeamPlayersRealTime(teamId: string): void {
    if (this.playersSub) {
      this.playersSub.unsubscribe();
    }
  
    this.playersSub = this.playerService.getTeamPlayersRealTime(teamId).subscribe({
      next: (players) => {
        this.teamPlayers = players;
  
        // Ordenar según rol
        const roleOrder = ['Carry (Safe Lane)', 'Mid Lane', 'Offlane', 'Hard Support', 'Soft Support'];
        this.teamPlayers.sort((a, b) =>
          roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
        );
      },
      error: (err) => {
        console.error('[LOBBY] Error listening to team players:', err);
      }
    });
  }

  private loadTeamPlayers(teamId: string): void {
    this.playerService.getTeamPlayers(teamId).subscribe({
      next: (players) => {
        this.teamPlayers = players;
        // Ordenar jugadores por rol
        this.teamPlayers.sort((a, b) => 
          this.roles.indexOf(a.role) - this.roles.indexOf(b.role)
        );
      },
      error: (err) => {
        console.error('[LOBBY] Error loading team players:', err);
      }
    });
  }

  private loadAvailablePlayers(): void {
    if (this.availablePlayersSub) {
      this.availablePlayersSub.unsubscribe();
    }
  
    this.availablePlayersSub = this.playerService.getAvailablePlayers().subscribe({
      next: (players) => {
        this.availablePlayers = players.filter(p => p.uid !== this.currentUserUid);
  
        // Actualizar categorías si es necesario
        const allCategories = new Set(players.map(p => p.category).filter(c => c));
        this.categories = ['Tier1', 'Tier2', 'Tier3', 'Tier4', 'Tier5'];
        this.filteredCategories = this.categories;
      },
      error: (err) => {
        console.error('[LOBBY] Error loading players:', err);
        this.errorMessage = 'Error al cargar jugadores';
      }
    });
  }

  openCreateTeamDialog(): void {
    const dialogRef = this.dialog.open(CreateTeamDialogComponent, {
      width: '500px',
      data: { 
        captainId: this.player.uid,
        captainName: this.player.nick,
        category: this.player.category
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTeam(result);
      }
    });
  }

  openAddPlayerDialog(role: string): void {
    if (!this.userTeam || !this.isTeamCaptain) return;
    
    // Filtramos jugadores disponibles para este rol
    const availablePlayersForRole = this.availablePlayers.filter(
      player => player.role === role || player.secondaryRole === role
    );
  
    const dialogRef = this.dialog.open(AddPlayerDialogComponent, {
      width: '600px',
      data: {
        role,
        players: availablePlayersForRole,
        teamId: this.userTeam.id
      }
    });
  
    dialogRef.afterClosed().subscribe((selectedPlayerId: string | undefined) => {
      if (selectedPlayerId) {
        this.addPlayerToTeam(availablePlayersForRole.find(p => p.uid === selectedPlayerId)!);
      }
    });
  }

  createTeam(teamData: { name: string, description: string }): void {
    if (!this.player.uid) return;

    const newTeam: Omit<Team, 'id'> = {
      name: teamData.name,
      captainId: this.player.uid,
      players: [{
        uid: this.player.uid,
        role: this.player.role,
        avatar: this.player.avatar,
        mmr: this.player.mmr,
        nick: this.player.nick,
        medalImage: this.player.medalImage
      }],
      category: this.player.category,
      createdAt: new Date(),
      description: teamData.description,
      status: 'active'
    };

    this.playerService.createTeam(newTeam).subscribe({
      next: (teamId) => {
        // Actualizar el jugador para marcar que tiene equipo
        this.playerService.updatePlayer(this.player.uid, { 
          teamId,
          availability: 'in_team'
        }).subscribe(() => {
          this.loadUserTeam(this.player.uid);
        });
      },
      error: (err) => {
        console.error('[LOBBY] Error creating team:', err);
        this.errorMessage = 'Error al crear equipo';
      }
    });
  }

  addPlayerToTeam(player: Player): void {
    if (!this.userTeam || !this.isTeamCaptain) return;
    if (this.userTeam.players.length >= 5) {
      this.errorMessage = 'El equipo ya tiene el máximo de 5 jugadores';
      return;
    }
    this.playerService.addPlayerToTeam(
      this.userTeam.id, 
      player.uid, 
      player.role, 
      player.avatar, 
      player.mmr,
      player.nick,
      player.medalImage
    ).subscribe({
      next: () => {
        this.loadTeamPlayers(this.userTeam!.id);
        this.loadAvailablePlayers();
      },
      error: (err) => {
        console.error('[LOBBY] Error adding player to team:', err);
        this.errorMessage = 'Error al añadir jugador al equipo';
      }
    });
  }

  removePlayerFromTeam(player: Player): void {
    if (!this.userTeam || !this.isTeamCaptain) return;
  
    this.playerService.removePlayerFromTeam(
      this.userTeam.id, 
      player.uid,
      player.role,
      player.avatar,
      player.mmr,
      player.nick,
      player.medalImage
    ).subscribe({
      next: () => {
        this.loadTeamPlayers(this.userTeam!.id);
        this.loadAvailablePlayers();
      },
      error: (err) => {
        console.error('[LOBBY] Error removing player from team:', err);
        this.errorMessage = 'Error al remover jugador del equipo';
      }
    });
  }

  // drop(event: CdkDragDrop<any>) {
  //   if (event.previousContainer !== event.container) {
  //     // Solo permitir mover al jugador a roles vacíos
  //     if (!event.container.data.player) {
  //       const newRole = event.container.data.role;
  //       this.tempRole = newRole;
  //       this.saveTempRole();
  //     }
  //   }
  // }

  private handleUnauthenticated(): void {
    this.errorMessage = 'Debes iniciar sesión';
    this.isLoading = false;
    this.router.navigate(['/login']);
  }

  toggleStatus(): void {
    if (!this.player.uid) return;
    
    const newStatus = this.player.status === 'Activo' ? 'Inactivo' : 'Activo';
    const updateSub = this.playerService.updatePlayer(this.player.uid, { status: newStatus }).subscribe({
      next: () => {
        this.player.status = newStatus;
        this.loadAvailablePlayers();
        updateSub.unsubscribe();
      },
      error: (err) => {
        console.error('[LOBBY] Error updating status:', err);
        updateSub.unsubscribe();
      }
    });
  }

  getStatusClass(): string {
    const status = this.player.status.toLowerCase();
    return status === 'activo' ? 'status-activo' : 
           status === 'inactivo' ? 'status-inactivo' : 
           status === 'suspendido' ? 'status-suspendido' : '';
  }

  async logout(): Promise<void> {
    try {
      // Limpiar el rol temporal al cerrar sesión
      this.clearTempRole();
      
      if (this.player.uid) {
        await new Promise<void>((resolve, reject) => {
          const updateSub = this.playerService.updatePlayer(this.player.uid, { status: 'Inactivo' })
            .subscribe({
              next: () => {
                updateSub.unsubscribe();
                resolve();
              },
              error: (err) => {
                updateSub.unsubscribe();
                reject(err);
              }
            });
        });
      }
      
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('[LOBBY] Logout error:', error);
    }
  }

  applyFilters(): void {
    this.filteredCategories = this.categories;
  }

  refreshPlayers(): void {
    this.loadAvailablePlayers();
  }

  getPlayersByCategory(category: string): Player[] {
    return this.availablePlayers.filter(player => 
      player.category === category && 
      (this.selectedRole === 'all' || player.role === this.selectedRole)
    );
  }

  getPlayersByCategoryAndRole(category: string, role: string): Player[] {
    return this.availablePlayers.filter(player => 
      player.category === category && 
      player.role === role
    );
  }

  getPlayerStatusClass(player: Player): string {
    const status = player.status?.toLowerCase();
    return status === 'activo' ? 'status-activo' : 
           status === 'inactivo' ? 'status-inactivo' : 
           status === 'suspendido' ? 'status-suspendido' : '';
  }

  viewProfile(player: Player): void {
    console.log('View profile:', player.uid);
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    if (this.playersSub) this.playersSub.unsubscribe();
    if (this.teamsSub) this.teamsSub.unsubscribe();
    if (this.availablePlayersSub) this.availablePlayersSub.unsubscribe();
  }
}
