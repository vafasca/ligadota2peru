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

  constructor(private playerSvc:PlayerService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadPlayers();  // Carga de tarifas al iniciar el componente
    // this.playerSvc.addMatch('edfrrSC9hlQsjARWFnxV', '987654321').subscribe({
    //   next: () => console.log('Match agregado correctamente'),
    //   error: (err) => console.error('Error al agregar la partida:', err),
    // });
  }

  private loadPlayers(): void {
    this.subscription = this.playerSvc.getPlayers().subscribe(
      (players) => {
        this.players = players;  // Asignación de tarifas obtenidas a la lista de planes
        console.log('Jugadores obtenidos:', this.players);  // Registro de tarifas obtenidas
      },
      (error) => {
        console.error('Error al obtener las tarifas:', error);  // Manejo de errores
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
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.snackBar.open('✅ Jugador registrado con éxito', 'Cerrar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            form.resetForm();
            this.selectedAvatar = 'https://placehold.co/400';
          },
          error: (error) => {
            this.snackBar.open('❌ Error al registrar jugador', 'Cerrar', {
              duration: 3000,
              panelClass: ['snackbar-error'],
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            console.error('Error al guardar el jugador:', error);
          }
        });
    }
  }

}
