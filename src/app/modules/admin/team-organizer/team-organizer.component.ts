import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Team } from '../models/equipos.model';
import { Player } from '../models/jugador.model';

type Tiers = {
  1: Player[];
  2: Player[];
  3: Player[];
  4: Player[];
  [key: number]: Player[]; // Firma de índice para acceso numérico
};

@Component({
  selector: 'app-team-organizer',
  templateUrl: './team-organizer.component.html',
  styleUrls: ['./team-organizer.component.css']
})
export class TeamOrganizerComponent {
  waitingPlayers: Player[] = [];
  tiers: Tiers = {
    1: [],
    2: [],
    3: [],
    4: []
  };
  
  teams: Team[] = [];
  nextTeamId = 1;

  getTierName(tier: number): string {
    const tierNames: Record<number, string> = {
      1: 'Leyendas (10k+ MMR)',
      2: 'Élite (7k-9k MMR)',
      3: 'Veteranos (4k-7k MMR)',
      4: 'Novatos (1k-4k MMR)'
    };
    return tierNames[tier] || 'Desconocido';
  }

  getPlayersByTier(tier: keyof Tiers): Player[] {
    return this.tiers[tier];
  }

  createNewTeam() {
    this.teams.push({
      id: this.nextTeamId++,
      name: `Equipo ${this.nextTeamId}`,
      members: [],
      captain: null
    });
  }

  assignCaptain(team: Team) {
    // Limpiar capitán anterior
    team.members.forEach(p => p.isCaptain = false);
    
    const corePlayers = team.members.filter(p => this.isCorePlayer(p));
    if (corePlayers.length > 0) {
      team.captain = corePlayers[0];
      corePlayers[0].isCaptain = true;
    }
  }

  private isCorePlayer(player: Player): boolean {
    // Asumiendo que el campo 'category' contiene la información del rol
    return player.category.toLowerCase().includes('core');
  }

  drop(event: CdkDragDrop<Player[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Actualizar estado del capitán
      const movedPlayer = event.container.data[event.currentIndex];
      if (movedPlayer) {
        movedPlayer.isCaptain = false;
        
        // Si era capitán en el equipo anterior, limpiar
        if (movedPlayer.isCaptain) {
          const previousTeam = this.teams.find(t => t.members.includes(movedPlayer));
          if (previousTeam) previousTeam.captain = null;
        }
      }
    }
  }
}
