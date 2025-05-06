import { Pipe, PipeTransform } from '@angular/core';
import { Player } from '../../admin/models/jugador.model';

@Pipe({
  name: 'filterByRole'
})
export class FilterByRolePipePipe implements PipeTransform {
  transform(players: Player[], role: string): Player[] {
    if (!players) return [];
    return players.filter(player => player.role === role);
  }
}
