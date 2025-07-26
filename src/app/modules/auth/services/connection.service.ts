import { Injectable } from '@angular/core';
import { PlayerService } from '../../admin/services/player.service';
import { AuthService } from './auth.service';
import { take } from 'rxjs';
import { PlayerStatus } from '../../admin/models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
constructor(
    private playerService: PlayerService,
    private authService: AuthService
  ) {
    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
    // Manejar cierre de pestaña/navegador
    window.addEventListener('beforeunload', () => this.setInactiveStatus());
    
    // Manejar recarga de página
    window.addEventListener('unload', () => this.setInactiveStatus());
  }

  private async setInactiveStatus(): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      try {
        await this.playerService.updatePlayer(userId, { status: PlayerStatus.Inactive }).pipe(take(1)).toPromise();
      } catch (error) {
        console.error('Error al actualizar estado a inactivo:', error);
      }
    }
  }

  ngOnDestroy(): void {
    // Limpiar event listeners
    window.removeEventListener('beforeunload', () => this.setInactiveStatus());
    window.removeEventListener('unload', () => this.setInactiveStatus());
  }
}
