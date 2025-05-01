import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Player } from '../models/jugador.model';
import { PlayerService } from '../services/player.service';
import { finalize, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-player-registration',
  templateUrl: './player-registration.component.html',
  styleUrls: ['./player-registration.component.css']
})
export class PlayerRegistrationComponent {

  private subscription: Subscription = new Subscription();
  isLoading = false;
  selectedAvatar: string | ArrayBuffer = 'https://placehold.co/400';
  players: Player[] = [];

  constructor(private playerSvc: PlayerService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadPlayers();
  }

  private loadPlayers(): void {
    this.subscription = this.playerSvc.getPlayers().subscribe(
      (players) => {
        this.players = players;
        console.log('Jugadores obtenidos:', this.players);
      },
      (error) => {
        console.error('Error al obtener jugadores:', error);
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedAvatar = reader.result!;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.isLoading = true;
  
      const mmrValue = Number(form.value.mmr) || 0;
      const { medal, medalImage } = this.calculateMedalAndImage(mmrValue);
  
      const newPlayer: Player = {
        avatar: this.selectedAvatar.toString(),
        nick: form.value.nick,
        idDota: form.value.idDota,
        category: form.value.category,
        mmr: mmrValue,
        status: form.value.status || 'Activo',
        rating: form.value.rating || 0,
        observations: form.value.observations || '',
        medal: medal,
        medalImage: medalImage,
        role: form.value.role || 'Por definir',
        secondaryRole: form.value.secondaryRole || '',
        secondaryCategory: form.value.secondaryCategory || '',
        isCaptain: false,
        registrationDate: new Date(),
        socialMedia: {}
      };
  
      this.playerSvc.addPlayer(newPlayer)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.showSnackbar('✅ Jugador registrado con éxito', 'success');
            form.resetForm();
            this.selectedAvatar = 'https://placehold.co/400';
          },
          error: (error) => {
            this.showSnackbar('❌ Error al registrar jugador', 'error');
            console.error('Error al guardar el jugador:', error);
          }
        });
    }
  }

  private calculateMedalAndImage(mmr: number): { medal: string, medalImage: string } {
    const medalRanges = [
      { name: 'Heraldo 1', min: 1, max: 154, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-herald-1.png' },
      { name: 'Heraldo 2', min: 154, max: 308, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-herald-2.png' },
      { name: 'Heraldo 3', min: 308, max: 462, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-herald-3.png' },
      { name: 'Heraldo 4', min: 462, max: 616, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-herald-4.png' },
      { name: 'Heraldo 5', min: 616, max: 770, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-herald-5.png' },
      { name: 'Guardián 1', min: 770, max: 924, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-guardian-1.png' },
      { name: 'Guardián 2', min: 924, max: 1078, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-guardian-2.png' },
      { name: 'Guardián 3', min: 1078, max: 1232, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-guardian-3.png' },
      { name: 'Guardián 4', min: 1232, max: 1386, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-guardian-4.png' },
      { name: 'Guardián 5', min: 1386, max: 1540, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-guardian-5.png' },
      { name: 'Cruzado 1', min: 1540, max: 1694, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-crusader-1.png' },
      { name: 'Cruzado 2', min: 1694, max: 1848, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-crusader-2.png' },
      { name: 'Cruzado 3', min: 1848, max: 2002, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-crusader-3.png' },
      { name: 'Cruzado 4', min: 2002, max: 2156, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-crusader-4.png' },
      { name: 'Cruzado 5', min: 2156, max: 2310, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-crusader-5.png' },
      { name: 'Arconte 1', min: 2310, max: 2464, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-archon-1.png' },
      { name: 'Arconte 2', min: 2464, max: 2618, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-archon-2.png' },
      { name: 'Arconte 3', min: 2618, max: 2772, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-archon-3.png' },
      { name: 'Arconte 4', min: 2772, max: 2926, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-archon-4.png' },
      { name: 'Arconte 5', min: 2926, max: 3080, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-archon-1.png' },
      { name: 'Leyenda 1', min: 3080, max: 3234, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-legend-1.png' },
      { name: 'Leyenda 2', min: 3234, max: 3388, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-legend-2.png' },
      { name: 'Leyenda 3', min: 3388, max: 3542, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-legend-3.png' },
      { name: 'Leyenda 4', min: 3542, max: 3696, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-legend-4.png' },
      { name: 'Leyenda 5', min: 3696, max: 3850, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-legend-5.png' },
      { name: 'Antiguo 1', min: 3850, max: 4004, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-ancient-1.png' },
      { name: 'Antiguo 2', min: 4004, max: 4158, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-ancient-2.png' },
      { name: 'Antiguo 3', min: 4158, max: 4312, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-ancient-3.png' },
      { name: 'Antiguo 4', min: 4312, max: 4466, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-ancient-4.png' },
      { name: 'Antiguo 5', min: 4466, max: 4620, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-ancient-5.png' },
      { name: 'Divino 1', min: 4620, max: 4820, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-divine-1.png' },
      { name: 'Divino 2', min: 4820, max: 5020, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-divine-2.png' },
      { name: 'Divino 3', min: 5020, max: 5220, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-divine-3.png' },
      { name: 'Divino 4', min: 5220, max: 5420, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-divine-4.png' },
      { name: 'Divino 5', min: 5420, max: 5620, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-divine-5.png' },
      { name: 'Inmortal', min: 5620, max: 8300, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal.png' },
      { name: 'Top 1000 Inmortal', min: 8300, max: 10000, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal.png' },
      { name: 'Top 100 Inmortal', min: 10000, max: 12000, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal-top-100.png' },
      { name: 'Top 10 Inmortal', min: 12000, max: Infinity, image: 'https://hawk.live/images/dota-2-seasonal-ranking-medals/seasonal-rank-immortal-top-10.png' }
    ];

    const foundMedal = medalRanges.find(range => mmr >= range.min && mmr < range.max) || 
                      { name: 'Sin medalla', image: 'rank_icon_0.png' };

    return {
      medal: foundMedal.name,
      medalImage: `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/rank_icons/${foundMedal.image}`
    };
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
