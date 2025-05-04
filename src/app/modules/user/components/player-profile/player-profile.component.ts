import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/modules/admin/models/jugador.model';
import { Match } from 'src/app/modules/admin/models/match.model';
import { PlayerService } from 'src/app/modules/admin/services/player.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Auth, onAuthStateChanged, signOut  } from '@angular/fire/auth';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent {
  @ViewChild('matchesContainer') matchesContainer!: ElementRef;
  showAllMatches = false;
  
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

  matches: Match[] = [];
  stats = {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgKDA: '0/0/0'
  };

  isLoading = true;
  errorMessage = '';
  private authSubscription: Subscription = new Subscription();
  private playerSub!: Subscription;
  private matchesSub!: Subscription;
  currentUserUid: string | null = null;

  constructor(
    private router: Router,
    private playerService: PlayerService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
    this.setupBeforeUnloadListener();
  }

  private setupAuthListener(): void {
    this.authSubscription = new Subscription();
    
    const unsubscribe = onAuthStateChanged(this.auth, (user) => {
      console.log('[PROFILE] Estado de autenticación cambiado:', user ? 'Autenticado' : 'No autenticado');
      this.currentUserUid = user?.uid || null;
      
      if (user) {
        console.log('[PROFILE] Detalles del usuario:', {
          uid: user.uid,
          email: user.email
        });
        this.loadPlayerData(user.uid);
      } else {
        console.log('[PROFILE] No hay usuario autenticado');
        this.handleUnauthenticated();
      }
    });
    
    this.authSubscription.add({ unsubscribe });
  }

  private setupBeforeUnloadListener(): void {
    window.addEventListener('beforeunload', () => {
      if (this.auth.currentUser) {
        // Opcional: Enviar señal al backend para registrar cierre
        this.cleanupBeforeUnload();
      }
    });
  }

  private cleanupBeforeUnload(): void {
    // Limpiar datos sensibles del localStorage/sessionStorage
    localStorage.removeItem('firebase:authUser');
    sessionStorage.clear();
  }

  private loadPlayerData(uid: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.playerSub = this.playerService.getPlayer(uid).subscribe({
      next: (playerData) => {
        if (playerData) {
          this.player = playerData;
          console.log('[PROFILE] Datos del jugador cargados:', this.player);
          this.loadPlayerMatches(uid);
        } else {
          this.errorMessage = 'Perfil no encontrado. Completa tu registro.';
          this.isLoading = false;
          console.log('[PROFILE] Redirigiendo a complete-profile');
          this.router.navigate(['/complete-profile']);
        }
      },
      error: (err) => {
        console.error('[PROFILE] Error cargando jugador:', err);
        this.errorMessage = 'Error al cargar perfil. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  private loadPlayerMatches(uid: string): void {
    this.matchesSub = this.playerService.getPlayerMatches(uid).subscribe({
      next: (matches) => {
        this.matches = matches;
        this.player.matches = matches;
        this.calculateStats();
        this.isLoading = false;
        console.log('[PROFILE] Partidas cargadas:', matches.length);
      },
      error: (err) => {
        console.error('[PROFILE] Error cargando partidas:', err);
        this.isLoading = false;
        this.calculateStats();
      }
    });
  }

  private handleUnauthenticated(): void {
    this.errorMessage = 'Debes iniciar sesión para ver este perfil';
    this.isLoading = false;
    console.log('[PROFILE] Redirigiendo a login');
    setTimeout(() => {
      this.router.navigate(['/login']).then(() => {
        window.location.reload(); // Limpia el estado de la aplicación
      });
    }, 1500);
  }

  private calculateStats(): void {
    this.stats.totalMatches = this.matches.length;
    this.stats.wins = this.matches.filter(m => m.result === 'win').length;
    this.stats.losses = this.matches.filter(m => m.result === 'loss').length;
    this.stats.winRate = this.stats.totalMatches > 0 
      ? Math.round((this.stats.wins / this.stats.totalMatches) * 100) 
      : 0;
    this.stats.avgKDA = this.calculateAvgKDA();
    console.log('[PROFILE] Estadísticas calculadas:', this.stats);
  }

  private calculateAvgKDA(): string {
    if (this.matches.length === 0) return '0/0/0';
    
    const totalKills = this.matches.reduce((sum, match) => sum + match.kills, 0);
    const totalDeaths = this.matches.reduce((sum, match) => sum + match.deaths, 0);
    const totalAssists = this.matches.reduce((sum, match) => sum + match.assists, 0);
    
    const avgKills = (totalKills / this.matches.length).toFixed(1);
    const avgDeaths = (totalDeaths / this.matches.length).toFixed(1);
    const avgAssists = (totalAssists / this.matches.length).toFixed(1);
    
    return `${avgKills}/${avgDeaths}/${avgAssists}`;
  }

  toggleStatus(): void {
    if (!this.player.uid) return;
    
    const newStatus = this.player.status === 'Activo' ? 'Inactivo' : 'Activo';
    console.log('[PROFILE] Cambiando estado a:', newStatus);
    
    const updateSub = this.playerService.updatePlayer(this.player.uid, { status: newStatus }).subscribe({
      next: () => {
        this.player.status = newStatus;
        console.log('[PROFILE] Estado actualizado correctamente');
        updateSub.unsubscribe();
      },
      error: (err) => {
        console.error('[PROFILE] Error al actualizar estado:', err);
        updateSub.unsubscribe();
      }
    });
  }

  get statusClass(): string {
    const status = this.player.status.toLowerCase();
    return status === 'activo' ? 'status-activo' : 
           status === 'inactivo' ? 'status-inactivo' : 
           status === 'suspendido' ? 'status-suspendido' : '';
  }

  toggleMatches(): void {
    console.log('[PROFILE] Alternando visualización de partidas');
    if (this.showAllMatches) {
      this.matchesContainer.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        this.showAllMatches = !this.showAllMatches;
      }, 300);
    } else {
      this.showAllMatches = !this.showAllMatches;
    }
  }

  async logout(): Promise<void> {
    console.log('[PROFILE] Cerrando sesión...');
    try {
      await signOut(this.auth);
      console.log('[PROFILE] Sesión cerrada en Firebase');
      
      this.clearLocalData();
      
      await this.router.navigate(['/login']);
      window.location.reload(); // Limpieza completa
    } catch (error) {
      console.error('[PROFILE] Error al cerrar sesión:', error);
    }
  }

  private clearLocalData(): void {
    // Resetear todas las propiedades del componente
    this.player = {
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

    this.matches = [];
    this.stats = {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgKDA: '0/0/0'
    };

    // Limpiar almacenamiento local
    localStorage.removeItem('firebase:authUser');
    sessionStorage.clear();
  }

  goToLobby(): void {
    console.log('[PROFILE] Navegando al lobby');
    this.router.navigate(['/lobby']);
  }

  get visibleMatches(): Match[] {
    return this.showAllMatches ? this.matches : this.matches.slice(0, 3);
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.cleanupSubscriptions();
    window.removeEventListener('beforeunload', () => {});
  }

  private cleanupSubscriptions(): void {
    if (this.playerSub) this.playerSub.unsubscribe();
    if (this.matchesSub) this.matchesSub.unsubscribe();
  }
}
