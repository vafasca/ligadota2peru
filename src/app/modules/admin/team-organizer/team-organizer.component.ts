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
  
}
