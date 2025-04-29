import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Player } from '../models/jugador.model';

@Component({
  selector: 'app-player-registration',
  templateUrl: './player-registration.component.html',
  styleUrls: ['./player-registration.component.css']
})
export class PlayerRegistrationComponent {
  players: Player[] = []; // Array para almacenar todos los jugadores
  selectedAvatar: string | ArrayBuffer = 'https://placehold.co/400';

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
  
      this.players.push(newPlayer);
      console.log('Jugador registrado:', newPlayer);
      console.log('Todos los jugadores:', this.players);
      
      form.resetForm();
      this.selectedAvatar = 'https://placehold.co/400';
    } else {
      console.error('Formulario inválido. Razones:');
      
      // Mostrar detalles del error
      Object.keys(form.controls).forEach(key => {
        const controlErrors = form.controls[key].errors;
        if (controlErrors) {
          console.log(`Campo: ${key}, Errores:`, controlErrors);
        }
      });
    }
  }
}
