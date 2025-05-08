import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/modules/admin/models/jugador.model';
import { Match } from 'src/app/modules/admin/models/match.model';
import { PlayerService } from 'src/app/modules/admin/services/player.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent {
  @ViewChild('matchesContainer') matchesContainer!: ElementRef;
  showAllMatches = false;
  
  // Datos del jugador inicializados vacíos
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
    status: 'Activo', // Valor por defecto
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
  private authSub!: Subscription;
  private playerSub!: Subscription;
  private matchesSub!: Subscription;

  constructor(
    private router: Router,
    private playerService: PlayerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  private setupAuthListener(): void {
    this.authSub = this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user?.uid) {
          this.loadPlayerData(user.uid);
        } else {
          this.handleUnauthenticated();
        }
      },
      error: (err) => {
        console.error('Error en auth listener:', err);
        this.handleUnauthenticated();
      }
    });
  }

  private loadPlayerData(uid: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.playerSub = this.playerService.getPlayer(uid).subscribe({
      next: (playerData) => {
        if (playerData) {
          this.player = playerData;
          // console.log('Datos del jugador cargados:', this.player);
          this.loadPlayerMatches(uid);
        } else {
          this.errorMessage = 'Perfil no encontrado. Completa tu registro.';
          this.isLoading = false;
          this.router.navigate(['/complete-profile']);
        }
      },
      error: (err) => {
        console.error('Error cargando jugador:', err);
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
      },
      error: (err) => {
        console.error('Error cargando partidas:', err);
        this.isLoading = false;
        this.calculateStats(); // Mostrar stats aunque falle la carga
      }
    });
  }

  private handleUnauthenticated(): void {
    this.errorMessage = 'Debes iniciar sesión para ver este perfil';
    this.isLoading = false;
    setTimeout(() => {
      this.router.navigate(['/login']);
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
    const updateSub = this.playerService.updatePlayer(this.player.uid, { status: newStatus }).subscribe({
      next: () => {
        this.player.status = newStatus;
        updateSub.unsubscribe();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        updateSub.unsubscribe();
      }
    });
  }

  getStatusClass(): string {
    switch(this.player.status.toLowerCase()) {
      case 'activo': return 'status-activo';
      case 'inactivo': return 'status-inactivo';
      case 'suspendido': return 'status-suspendido';
      default: return '';
    }
  }

  toggleMatches(): void {
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
      
      // Cerrar sesión usando el AuthService
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  goToLobby(): void {
    this.router.navigate(['/lobby']);
  }

  get visibleMatches(): Match[] {
    return this.showAllMatches ? this.matches : this.matches.slice(0, 3);
  }

  private cleanupSubscriptions(): void {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.playerSub) this.playerSub.unsubscribe();
    if (this.matchesSub) this.matchesSub.unsubscribe();
  }
}
