import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Match } from 'src/app/modules/admin/models/match.model';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent {
  showAllMatches = false;
  
  // Datos completos del jugador simulado
  player = {
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
    observations: 'Jugador especializado en late game. Excelente farmeo y manejo de objetivos. ' +
                 'Prefiere héroes de agilidad que escalan bien con items. ' +
                 'Necesita mejorar participación temprana en teamfights.',
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

  // Historial de partidas simulado
  matches = [
    {
      id: '1',
      result: 'win' as const, // <-- 'win' literal
      date: new Date('2023-05-15T20:30:00'),
      heroName: 'Anti-Mage',
      heroImage: 'https://cdn.dota2.com/apps/dota2/images/heroes/antimage_full.png',
      kills: 12,
      deaths: 8,
      assists: 8,
      ratingChange: 25
    },
    {
      id: '2',
      result: 'loss' as const, // <-- 'loss' literal
      date: new Date('2023-05-14T18:45:00'),
      heroName: 'Juggernaut',
      heroImage: 'https://cdn.dota2.com/apps/dota2/images/heroes/juggernaut_full.png',
      kills: 8,
      deaths: 8,
      assists: 1,
      ratingChange: -10
    },
    {
      id: '3',
      result: 'win' as const, // <-- 'win' literal
      date: new Date('2023-05-15T20:30:00'),
      heroName: 'Anti-Mage',
      heroImage: 'https://cdn.dota2.com/apps/dota2/images/heroes/mars_full.png',
      kills: 12,
      deaths: 13,
      assists: 8,
      ratingChange: 25
    },
    {
      id: '4',
      result: 'win' as const, // <-- 'win' literal
      date: new Date('2023-05-15T20:30:00'),
      heroName: 'Anti-Mage',
      heroImage: 'https://cdn.dota2.com/apps/dota2/images/heroes/axe_full.png',
      kills: 12,
      deaths: 3,
      assists: 8,
      ratingChange: 25
    },
    {
      id: '5',
      result: 'loss' as const, // <-- 'loss' literal
      date: new Date('2023-05-14T18:45:00'),
      heroName: 'Juggernaut',
      heroImage: 'https://cdn.dota2.com/apps/dota2/images/heroes/sven_full.png',
      kills: 8,
      deaths: 15,
      assists: 12,
      ratingChange: -10
    }
    // ... resto de las partidas
  ];

  // Estadísticas calculadas
  stats = {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgKDA: '0/0/0' // Inicializa con un valor por defecto
  };

  constructor(private router: Router) {
    this.calculateStats();
  }

  private calculateStats(): void {
    this.stats.totalMatches = this.matches.length;
    this.stats.wins = this.matches.filter(m => m.result === 'win').length;
    this.stats.losses = this.matches.filter(m => m.result === 'loss').length;
    this.stats.winRate = Math.round((this.stats.wins / this.stats.totalMatches) * 100) || 0;
    this.stats.avgKDA = this.calculateAvgKDA();
  }

  // Función para calcular el KDA promedio
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

  // Función para cambiar el estado
  toggleStatus(): void {
    this.player.status = this.player.status === 'Activo' ? 'Inactivo' : 'Activo';
  }

  // Función para obtener la clase CSS del estado
  getStatusClass(): string {
    switch(this.player.status.toLowerCase()) {
      case 'activo': return 'status-activo';
      case 'inactivo': return 'status-inactivo';
      case 'suspendido': return 'status-suspendido';
      default: return '';
    }
  }

  // Función para mostrar más/menos partidas
  toggleMatches(): void {
    this.showAllMatches = !this.showAllMatches;
  }

  // Función para cerrar sesión
  logout(): void {
    // Aquí iría la lógica para cerrar sesión
    this.router.navigate(['/login']);
  }

  // Función para obtener las partidas visibles
  get visibleMatches(): Match[] {
    return this.showAllMatches ? this.matches : this.matches.slice(0, 5);
  }
}
