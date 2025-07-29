import { Component, Input } from '@angular/core';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';

@Component({
  selector: 'app-format-rules',
  templateUrl: './format-rules.component.html',
  styleUrls: ['./format-rules.component.css']
})
export class FormatRulesComponent {
  @Input() tournament: Tournament | null = null;
  @Input() customRules: string[] = [];
  
  formatDescriptions: Record<string, {title: string, description: string, rules: string[]}> = {
    'Single Elimination': {
      title: 'Eliminación Simple',
      description: 'Formato rápido donde los equipos son eliminados tras una derrota. Ideal para torneos con muchos participantes y tiempo limitado.',
      rules: [
        'Cada partido es eliminatorio',
        'El perdedor queda fuera del torneo',
        'Rápido de organizar y ejecutar',
        'Puede no ser el más justo para determinar al mejor equipo'
      ]
    },
    'Double Elimination': {
      title: 'Doble Eliminación',
      description: 'Formato competitivo donde los equipos tienen que perder dos veces antes de ser eliminados. Más justo que la eliminación simple.',
      rules: [
        'Los equipos tienen que perder dos veces para ser eliminados',
        'Los perdedores de la ronda de ganadores pasan a la ronda de perdedores',
        'Más justo que Single Elimination',
        'Toma más tiempo que Single Elimination'
      ]
    },
    'Round Robin': {
      title: 'Round Robin',
      description: 'Todos los equipos juegan contra todos los demás. Ideal para torneos pequeños donde se quiere determinar claramente al mejor equipo.',
      rules: [
        'Cada equipo juega contra todos los demás',
        'Se otorgan puntos por victorias/empates',
        'El equipo con más puntos gana',
        'Muy justo pero requiere más tiempo'
      ]
    },
    'Swiss': {
      title: 'Sistema Suizo',
      description: 'Los equipos son emparejados contra oponentes con un rendimiento similar. Buen equilibrio entre justicia y tiempo.',
      rules: [
        'Emparejamientos basados en rendimiento',
        'Nadie es eliminado temprano',
        'Bueno para torneos con muchos participantes',
        'Requiere sistema de puntuación claro'
      ]
    },
    'League + Playoffs': {
      title: 'Liga + Playoffs',
      description: 'Fase de grupos seguida de eliminatorias. Ideal para torneos largos y profesionales.',
      rules: [
        'Fase de liga donde todos juegan contra todos',
        'Los mejores avanzan a playoffs eliminatorios',
        'Combina lo mejor de Round Robin y Eliminación',
        'Requiere mucho tiempo y organización'
      ]
    }
  };
}
