import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/modules/admin/models/jugador.model';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { PlayerService } from 'src/app/modules/admin/services/player.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

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
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
    // Al iniciar, cargamos el rol temporal si existe
    this.loadTempRole();
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
          // Si no hay rol temporal, usamos el de la BD
          if (!this.tempRole) {
            this.tempRole = this.player.role;
          }
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
        this.availablePlayers = players.filter(p => 
          p.status === 'Activo' && 
          (p.uid !== this.currentUserUid || this.player.status === 'Activo')
        );
        
        const allCategories = new Set(players.map(p => p.category).filter(c => c));
        this.categories = ['Tier1', 'Tier2', 'Tier3', 'Tier4', 'Tier5'];
        this.filteredCategories = this.categories;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[LOBBY] Error loading players:', err);
        this.errorMessage = 'Error al cargar jugadores';
        this.isLoading = false;
      }
    });
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer !== event.container) {
      // Solo permitir mover al jugador a roles vacíos
      if (!event.container.data.player) {
        const newRole = event.container.data.role;
        this.tempRole = newRole;
        this.saveTempRole();
      }
    }
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
    if (this.playersSub) {
      this.playersSub.unsubscribe();
    }
  }
}
