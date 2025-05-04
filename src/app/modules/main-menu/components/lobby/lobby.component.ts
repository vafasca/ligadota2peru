import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from 'src/app/modules/admin/models/jugador.model';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent {
  private authSubscription: Subscription = new Subscription();
  currentUserUid: string | null = null;

  player: Player = {
    uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa2',
    avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/antimage_full.png',
    nick: 'AntiMagePro',
    idDota: 123456789,
    category: 'Tier 2',
    mmr: 9300,
    medal: 'Immortal',
    medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal.png',
    rating: 87,
    status: 'Activo',
    role: 'Carry (Safe Lane)',
    secondaryRole: 'Mid Lane',
    secondaryCategory: 'Tier 3',
    observations: 'Jugador especializado en late game. Excelente farmeo y manejo de objetivos.',
    socialMedia: {
      twitch: 'https://twitch.tv',
      youtube: 'https://youtube.com',
      kick: 'https://kick.com',
      twitter: 'https://x.com',
      discord: 'https://discord.com',
      instagram: 'https://www.instagram.com/',
      facebook: 'https://www.facebook.com/',
      tiktok: 'https://www.tiktok.com/'
    }
  };

  availablePlayers: Player[] = [
    {
      uid: '8D76ITmh2dcjDj88VJW5v22L7Eoqa2',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/nevermore_full.png',
      nick: 'serranogamer',
      idDota: 987654321,
      mmr: 8500,
      medal: 'Immortal',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal.png',
      category: 'Tier 1',
      role: 'Mid Lane',
      status: 'Activo',
      rating: 85,
      secondaryRole: 'Carry (Safe Lane)',
      secondaryCategory: 'Tier 1'
    },
    {
      uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa3',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/crystal_maiden_full.png',
      nick: 'Stingerdota',
      idDota: 876543219,
      mmr: 4500,
      medal: 'Ancient',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-ancient-5.png',
      category: 'Tier 3',
      role: 'Hard Support',
      status: 'Activo',
      rating: 45,
      secondaryRole: 'Soft Support',
      secondaryCategory: 'Tier 3'
    },
    {
      uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa4',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/puck_full.png',
      nick: 'sideral',
      idDota: 112233445,
      mmr: 9200,
      medal: 'Immortal',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal.png',
      category: 'Tier 1',
      role: 'Mid Lane',
      status: 'Activo',
      rating: 89,
      secondaryRole: 'Offlane',
      secondaryCategory: 'Tier 2'
    },
    {
      uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa5',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/storm_spirit_full.png',
      nick: 'noah_god',
      idDota: 556677889,
      mmr: 8900,
      medal: 'Immortal',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal.png',
      category: 'Tier 1',
      role: 'Mid Lane',
      status: 'Activo',
      rating: 87,
      secondaryRole: 'Carry (Safe Lane)',
      secondaryCategory: 'Tier 2'
    },
    {
      uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa6',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/templar_assassin_full.png',
      nick: 'Leostyle',
      idDota: 334455667,
      mmr: 9100,
      medal: 'Immortal',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal.png',
      category: 'Tier 1',
      role: 'Mid Lane',
      status: 'Activo',
      rating: 88,
      secondaryRole: 'Carry (Safe Lane)',
      secondaryCategory: 'Tier 1'
    },
    {
      uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa7',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/axe_full.png',
      nick: 'Wisper',
      idDota: 998877665,
      mmr: 7800,
      medal: 'Divine',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-divine-5.png',
      category: 'Tier 2',
      role: 'Offlane',
      status: 'Activo',
      rating: 78,
      secondaryRole: 'Mid Lane',
      secondaryCategory: 'Tier 3'
    },
    {
      uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa8',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/witch_doctor_full.png',
      nick: 'Scofield',
      idDota: 443322110,
      mmr: 5200,
      medal: 'Legend',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-legend-5.png',
      category: 'Tier 3',
      role: 'Soft Support',
      status: 'Activo',
      rating: 52,
      secondaryRole: 'Hard Support',
      secondaryCategory: 'Tier 3'
    },
    {
      uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa9',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/juggernaut_full.png',
      nick: 'vanngg',
      idDota: 778899001,
      mmr: 8300,
      medal: 'Immortal',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal.png',
      category: 'Tier 1',
      role: 'Carry (Safe Lane)',
      status: 'Activo',
      rating: 83,
      secondaryRole: 'Mid Lane',
      secondaryCategory: 'Tier 2'
    },
    {
      uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa10',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/lion_full.png',
      nick: 'Gelatita',
      idDota: 665544332,
      mmr: 1800,
      medal: 'Ancient 1',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-ancient-1.png',
      category: 'Tier 4',
      role: 'Hard Support',
      status: 'Activo',
      rating: 48,
      secondaryRole: 'Soft Support',
      secondaryCategory: 'Tier 3'
    },
    {
      uid: '8D76ITmh2dcjDj88VJW5vL7Eoqa11',
      avatar: 'https://cdn.dota2.com/apps/dota2/images/heroes/phantom_assassin_full.png',
      nick: 'elmacarius',
      idDota: 229988776,
      mmr: 8100,
      medal: 'Divine',
      medalImage: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-divine-5.png',
      category: 'Tier 2',
      role: 'Carry (Safe Lane)',
      status: 'Activo',
      rating: 81,
      secondaryRole: 'Mid Lane',
      secondaryCategory: 'Tier 2'
    }
  ];

  // Filtros
  categories: string[] = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
  roles: string[] = ['Carry (Safe Lane)', 'Mid Lane', 'Offlane', 'Hard Support', 'Soft Support'];
  selectedCategory: string = 'all';
  selectedRole: string = 'all';
  filteredCategories: string[] = this.categories;

  // Jugadores seleccionados y equipos
  selectedPlayers: Player[] = [];
  radiantTeam: Player[] = [];
  direTeam: Player[] = [];

  constructor(private router: Router, private auth: Auth) {
    this.setupAuthListener();
  }

  private setupAuthListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      console.log('AUTH_STATE_CHANGED - USUARIO RECIBIDO:', user);
      this.currentUserUid = user?.uid || null;
      console.log('CURRENT_USER_UID ACTUALIZADO:', this.currentUserUid);
      
      if (!this.currentUserUid) {
        console.log('🚨 [LOBBY] REDIRIGIENDO A LOGIN');
        this.router.navigate(['/login']);
      } else {
        console.log('🔄 [LOBBY] USUARIO AUTENTICADO');
        // Actualizar el UID del jugador principal si es necesario
        this.player.uid = this.currentUserUid;
      }
    });
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  // Métodos para el perfil del jugador
  toggleStatus(): void {
    this.player.status = this.player.status === 'Activo' ? 'Inactivo' : 'Activo';
  }

  getStatusClass(): string {
    switch(this.player.status.toLowerCase()) {
      case 'activo': return 'status-activo';
      case 'inactivo': return 'status-inactivo';
      case 'suspendido': return 'status-suspendido';
      default: return '';
    }
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  // Métodos para el lobby
  applyFilters(): void {
    if (this.selectedCategory === 'all' && this.selectedRole === 'all') {
      this.filteredCategories = this.categories;
    } else {
      this.filteredCategories = this.categories.filter(cat => {
        const players = this.getPlayersByCategory(cat);
        if (this.selectedRole !== 'all') {
          return players.some(p => p.role === this.selectedRole);
        }
        return players.length > 0;
      });
    }
  }

  refreshPlayers(): void {
    console.log('Refrescando lista de jugadores...');
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
    switch(player.status?.toLowerCase()) {
      case 'activo': return 'status-activo';
      case 'inactivo': return 'status-inactivo';
      case 'suspendido': return 'status-suspendido';
      default: return 'status-activo';
    }
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
    console.log('Ver perfil de:', player.idDota);
  }

  addToTeam(player: Player): void {
    if (this.radiantTeam.some(p => p.idDota === player.idDota) || 
        this.direTeam.some(p => p.idDota === player.idDota)) {
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
    
    console.log('Iniciando partida con equipos:', {
      radiant: this.radiantTeam,
      dire: this.direTeam
    });
    
    this.router.navigate(['/match']);
  }
}
