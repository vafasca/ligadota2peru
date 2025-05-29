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
import { TeamService } from '../../services/team.service';

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
  selectedRoleType: 'primary' | 'secondary' = 'primary';
  isCopied = false;
  lastCopiedId: number | null = null;

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
  //tempRole: string = '';

  allActivePlayers: Player[] = [];
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
    private dialog: MatDialog,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
    // Al iniciar, cargamos el rol temporal si existe
    //this.loadTempRole();
  }

  // private loadTempRole(): void {
  //   const savedRole = sessionStorage.getItem('tempRole');
  //   if (savedRole) {
  //     this.tempRole = savedRole;
  //   } else {
  //     this.tempRole = this.player.role;
  //   }
  // }

  // private saveTempRole(): void {
  //   sessionStorage.setItem('tempRole', this.tempRole);
  // }

  // private clearTempRole(): void {
  //   sessionStorage.removeItem('tempRole');
  // }

  private setupAuthListener(): void {
    this.authSubscription = new Subscription();
    
    const unsubscribe = onAuthStateChanged(this.auth, (user) => {
      this.currentUserUid = user?.uid || null;
      
      if (user) {
        this.loadPlayerData(user.uid);
        this.loadAvailablePlayers();
        this.loadUserTeam(user.uid);
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
    this.teamsSub = this.teamService.getUserTeam(playerId).subscribe({
      next: (userTeam) => {
        this.userTeam = userTeam || null;
        this.showTeamSection = !!this.userTeam || this.isTeamCaptain;
  
        if (this.userTeam) {
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
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const player = event.item.data;
      if (!player || !this.userTeam) return;
      
      const newRole = event.container.id;
      this.teamService.updatePlayerRole(this.userTeam.id, player.uid, newRole).subscribe({
        next: () => console.log(`Player role updated to ${newRole}`),
        error: (err) => console.error('Error updating player role:', err)
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
    
    return this.teamService.updatePlayerRole(
      this.userTeam.id, 
      playerUid, 
      newRole
    );
  }


  private loadTeamPlayersRealTime(teamId: string): void {
  if (this.playersSub) {
    this.playersSub.unsubscribe();
  }
  this.playersSub = this.teamService.getTeamPlayersRealTime(teamId).subscribe({
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
  
  // Suscribirse a jugadores activos (para el contador total)
  const activePlayersSub = this.playerService.getActivePlayers().subscribe({
    next: (players) => {
      this.allActivePlayers = players;
    },
    error: (err) => {
      console.error('[LOBBY] Error loading active players:', err);
    }
  });

  // Suscribirse a jugadores disponibles (para la lista de disponibles)
  const availablePlayersSub = this.playerService.getAvailablePlayers().subscribe({
    next: (players) => {
      this.availablePlayers = players.filter(p => p.uid !== this.currentUserUid);
      
      // Actualizar categorías si es necesario
      const allCategories = new Set(players.map(p => p.category).filter(c => c));
      this.categories = ['Tier1', 'Tier2', 'Tier3', 'Tier4', 'Tier5'];
      this.filteredCategories = this.categories;
    },
    error: (err) => {
      console.error('[LOBBY] Error loading available players:', err);
      this.errorMessage = 'Error al cargar jugadores';
    }
  });

  this.availablePlayersSub = new Subscription();
  this.availablePlayersSub.add(activePlayersSub);
  this.availablePlayersSub.add(availablePlayersSub);
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

    this.teamService.createTeam(newTeam).subscribe({
      next: (teamId) => {
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

  // Determinar el rol a usar según la vista actual
  const roleToUse = this.selectedRoleType === 'secondary' ?
    player.secondaryRole : player.role;

  this.playerService.addPlayerToTeam(
    this.userTeam.id,
    player.uid,
    roleToUse,  // Usamos el rol correcto según la vista
    player.avatar,
    player.mmr,
    player.nick,
    player.medalImage
  ).subscribe({
    next: () => {
      this.loadTeamPlayersRealTime(this.userTeam!.id);
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
        this.loadTeamPlayersRealTime(this.userTeam!.id);
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
      // this.clearTempRole();
      
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
      this.router.navigate(['/']);
    } catch (error) {
      console.error('[LOBBY] Logout error:', error);
    }
  }

  enCurso(): void {
    console.log('Buscando Partidas en curso...');
  }

  buscarRivales(): void {
    //this.router.navigate(['/matchmaking']);
    window.open('/matchmaking', '_blank');
  }

  // En tu LobbyComponent

getPlayersByCategory(category: string): Player[] {
  return this.availablePlayers.filter(player => {
    // Determinar qué campos usar según la selección
    const usePrimary = this.selectedRoleType === 'primary';
    
    const playerCategory = usePrimary ? player.category : player.secondaryCategory;
    const isNotCaptain = !player.isCaptain;
    
    return playerCategory === category && isNotCaptain;
  });
}

getPlayersByCategoryAndRole(category: string, role: string): Player[] {
  return this.availablePlayers.filter(player => {
    const usePrimary = this.selectedRoleType === 'primary';
    
    const playerCategory = usePrimary ? player.category : player.secondaryCategory;
    const playerRole = usePrimary ? player.role : player.secondaryRole;
    const isNotCaptain = !player.isCaptain;
    
    return playerCategory === category && 
           playerRole === role && 
           isNotCaptain;
  });
}

  // Método para aplicar los filtros
  applyFilters(): void {
  // Forzar la actualización
  this.filteredCategories = [...this.categories];
  
  // Debug (puedes remover esto después)
  console.log('Filtros aplicados:', {
    roleType: this.selectedRoleType,
    players: this.availablePlayers.map(p => ({
      nick: p.nick,
      category: p.category,
      secondaryCategory: p.secondaryCategory,
      role: p.role,
      secondaryRole: p.secondaryRole
    }))
  });
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

  // En el componente LobbyComponent
toggleCaptainStatus(): void {
  if (!this.player.uid) return;
  
  const newCaptainStatus = !this.isTeamCaptain;
  
  this.playerService.updatePlayer(this.player.uid, { 
    isCaptain: newCaptainStatus 
  }).subscribe({
    next: () => {
      this.isTeamCaptain = newCaptainStatus;
      this.showTeamSection = !!this.userTeam || this.isTeamCaptain;
      
      if (newCaptainStatus) {
        // Mensaje opcional cuando se convierte en capitán
        // alert('Ahora eres capitán!');
      } else {
        // Mensaje opcional cuando deja de ser capitán
        console.log('Ya no eres capitán');
      }
    },
    error: (err) => {
      console.error('Error al actualizar estado de capitán:', err);
    }
  });
}

/* DISOLVER TEAM */
async leaveTeam(): Promise<void> {
  if (!this.userTeam || !this.currentUserUid) return;

  const confirmation = confirm(
    this.isTeamCaptain 
      ? '¿Estás seguro de disolver el equipo? Esto eliminará el equipo completamente.'
      : '¿Estás seguro de abandonar el equipo?'
  );

  if (!confirmation) return;

  try {
    if (this.isTeamCaptain) {
      await this.dissolveTeam();
    } else {
      await this.leaveAsMember();
    }
    
    // Actualizar estado local
    this.userTeam = null;
    this.teamPlayers = [];
    this.isTeamCaptain = false;
    this.showTeamSection = false;
    
    if (this.player) {
      this.player.teamId = null;
      this.player.availability = 'available';
      this.player.isCaptain = false; // Asegurarse de actualizar también aquí
    }
    
    // Recargar datos
    this.loadAvailablePlayers();
  } catch (error) {
    console.error('Error al abandonar el equipo:', error);
    alert('Ocurrió un error al procesar la solicitud');
  }
}

private async dissolveTeam(): Promise<void> {
  if (!this.userTeam || !this.currentUserUid) return;

  // 1. Actualizar estado de todos los jugadores
  const playerUpdates = this.teamPlayers.map(player => {
    const updateData: Partial<Player> = {
      teamId: null,
      availability: 'available'
    };
    
    // Si es el capitán, también actualizar isCaptain
    if (player.uid === this.currentUserUid) {
      updateData.isCaptain = false;
    }
    
    return this.playerService.updatePlayer(player.uid, updateData).toPromise();
  });

  await Promise.all(playerUpdates);

  // 2. Eliminar el equipo
  await this.teamService.deleteTeam(this.userTeam.id).toPromise();
  
  // 3. Actualizar estado local del capitán
  if (this.player) {
    this.player.isCaptain = false;
  }
}

private async leaveAsMember(): Promise<void> {
  if (!this.userTeam || !this.currentUserUid) return;

  // 1. Remover al jugador del equipo
  const currentPlayer = this.teamPlayers.find(p => p.uid === this.currentUserUid);
  if (!currentPlayer) return;

  await this.playerService.removePlayerFromTeam(
    this.userTeam.id,
    currentPlayer.uid,
    currentPlayer.role,
    currentPlayer.avatar,
    currentPlayer.mmr,
    currentPlayer.nick,
    currentPlayer.medalImage
  ).toPromise();

  // 2. Actualizar estado del jugador
  await this.playerService.updatePlayer(this.currentUserUid, {
    teamId: null,
    availability: 'available'
  }).toPromise();
}

copyDotaId(idDota: number): void {
  if (!idDota) return;
  
  // Convertir a string para el portapapeles
  const idText = idDota.toString();
  
  navigator.clipboard.writeText(idText).then(() => {
    this.lastCopiedId = idDota;
    setTimeout(() => this.lastCopiedId = null, 1500);
  }).catch(err => {
    console.error('Error al copiar:', err);
    // Opcional: Mostrar mensaje de error al usuario
  });
}

// Método opcional para mostrar feedback visual
showCopyFeedback(): void {
  // Implementa tu lógica para mostrar un mensaje temporal
  // Puedes usar un toast, snackbar, o cambiar el texto momentáneamente
}

goToProfile(): void {
    if (this.player?.uid) {
      this.router.navigate(['/profile']);
    }
}

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    if (this.playersSub) this.playersSub.unsubscribe();
    if (this.teamsSub) this.teamsSub.unsubscribe();
    if (this.availablePlayersSub) this.availablePlayersSub.unsubscribe();
  }
}
