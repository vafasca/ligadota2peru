import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Player } from '../models/jugador.model';
import { PlayerService } from '../services/player.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-player-registration',
  templateUrl: './player-registration.component.html',
  styleUrls: ['./player-registration.component.css']
})
export class PlayerRegistrationComponent {

  constructor(private playerSvc:PlayerService) { }

  players: Player[] = [];
  selectedAvatar: string | ArrayBuffer = 'https://placehold.co/400';
  isLoading = false; // Para controlar el estado de carga

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

      const newPlayer: Player = {
        avatar: this.selectedAvatar.toString(),
        nick: form.value.nick,
        idDota: form.value.idDota,
        category: form.value.category,
        mmr: form.value.mmr,
        status: form.value.status,
        rating: form.value.rating,
        observations: form.value.observations
      };

      this.playerSvc.addPlayer(newPlayer)
        .pipe(
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            console.log('Jugador guardado en Firestore');
            form.resetForm();
            this.selectedAvatar = 'https://placehold.co/400';
          },
          error: (error) => {
            console.error('Error al guardar el jugador:', error);
          }
        });
    }
  }
}
