import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/modules/admin/models/jugador.model';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { PlayerService } from 'src/app/modules/admin/services/player.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent {
  
  private authSubscription: Subscription = new Subscription();
  private playersSub!: Subscription;
  currentUserUid: string | null = null;
  isLoading = true;
  errorMessage = '';

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

  availablePlayers: Player[] = [];
  categories: string[] = [];
  roles: string[] = ['Carry (Safe Lane)', 'Mid Lane', 'Offlane', 'Hard Support', 'Soft Support'];
  selectedCategory: string = 'all';
  selectedRole: string = 'all';
  filteredCategories: string[] = [];

  selectedPlayers: Player[] = [];
  radiantTeam: Player[] = [];
  direTeam: Player[] = [];

  constructor(
    private router: Router,
    private auth: Auth,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
  }

  private setupAuthListener(): void {
    this.authSubscription = new Subscription();
    
    const unsubscribe = onAuthStateChanged(this.auth, (user) => {
      console.log('[LOBBY] Auth state changed:', user ? 'Authenticated' : 'Not authenticated');
      this.currentUserUid = user?.uid || null;
      
      if (user) {
        this.loadPlayerData(user.uid);
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

  private loadAvailablePlayers(): void {
    this.playersSub = this.playerService.getPlayers().subscribe({
      next: (players) => {
        // Filtrar jugadores activos incluyendo al usuario actual si está activo
        this.availablePlayers = players.filter(p => 
          p.status === 'Activo' && 
          (p.uid !== this.currentUserUid || this.player.status === 'Activo')
        );
        
        // Extraer categorías únicas de todos los jugadores (no solo activos)
        const allCategories = new Set(players.map(p => p.category).filter(c => c));
        this.categories = ['Tier1', 'Tier2', 'Tier3', 'Tier4'];
        console.log('[LOBBY] Available players:', this.categories);
        
        // Mostrar todas las categorías siempre
        this.filteredCategories = this.categories;
        console.log('[LOBBY] Filtered categories:', this.filteredCategories);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[LOBBY] Error loading players:', err);
        this.errorMessage = 'Error al cargar jugadores';
        this.isLoading = false;
      }
    });
  }

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
        this.loadAvailablePlayers(); // Refresh the player list
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
      // Actualizar el estado a "Inactivo" antes de cerrar sesión
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
      
      // Cerrar sesión
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('[LOBBY] Logout error:', error);
    }
  }

  // Lobby methods
  applyFilters(): void {
    // Mostrar todas las categorías siempre
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

  toggleSelectPlayer(player: Player): void {
    const index = this.selectedPlayers.findIndex(p => p.idDota === player.idDota);
    if (index === -1) {
      this.selectedPlayers.push(player);
      this.addToTeam(player);
    } else {
      this.selectedPlayers.splice(index, 1);
      this.removeFromTeam(player.idDota);
    }
  }

  isSelected(player: Player): boolean {
    return this.selectedPlayers.some(p => p.idDota === player.idDota);
  }

  viewProfile(player: Player): void {
    console.log('View profile:', player.uid);
  }

  addToTeam(player: Player): void {
    if (this.radiantTeam.some(p => p.uid === player.uid) || 
        this.direTeam.some(p => p.uid === player.uid)) {
      return;
    }

    if (this.radiantTeam.length <= this.direTeam.length) {
      this.radiantTeam.push(player);
    } else {
      this.direTeam.push(player);
    }
  }

  removeFromTeam(idDota: number): void {
    this.radiantTeam = this.radiantTeam.filter(p => p.idDota !== idDota);
    this.direTeam = this.direTeam.filter(p => p.idDota !== idDota);
  }

  balanceTeams(): void {
    const allPlayers = [...this.radiantTeam, ...this.direTeam];
    allPlayers.sort((a, b) => b.mmr - a.mmr);
    
    this.radiantTeam = [];
    this.direTeam = [];
    
    allPlayers.forEach((player, index) => {
      if (index % 2 === 0) {
        this.radiantTeam.push(player);
      } else {
        this.direTeam.push(player);
      }
    });
  }

  randomizeTeams(): void {
    const allPlayers = [...this.radiantTeam, ...this.direTeam];
    
    for (let i = allPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
    }
    
    const half = Math.ceil(allPlayers.length / 2);
    this.radiantTeam = allPlayers.slice(0, half);
    this.direTeam = allPlayers.slice(half);
  }

  clearTeams(): void {
    this.radiantTeam = [];
    this.direTeam = [];
    this.selectedPlayers = [];
  }

  canStartMatch(): boolean {
    return this.radiantTeam.length >= 2 && this.direTeam.length >= 2;
  }

  startMatch(): void {
    if (!this.canStartMatch()) return;
    
    console.log('Starting match with teams:', {
      radiant: this.radiantTeam,
      dire: this.direTeam
    });
    
    this.router.navigate(['/match']);
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    if (this.playersSub) {
      this.playersSub.unsubscribe();
    }
  }
}
