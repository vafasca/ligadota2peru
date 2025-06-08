import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Player, PlayerAvailability, PlayerDivision, PlayerRole } from '../models/jugador.model';
import { PlayerService } from '../services/player.service';
import { finalize, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged  } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-player-registration',
  templateUrl: './player-registration.component.html',
  styleUrls: ['./player-registration.component.css']
})
export class PlayerRegistrationComponent {
  private subscription: Subscription = new Subscription();
  isLoading = false;
  selectedAvatar: string | ArrayBuffer = 'assets/medallas/profile_default.png';
  players: Player[] = [];
  currentUserUid: string | null = null;
  userRole: PlayerRole = PlayerRole.Player; // Valor por defecto
  playerDivision: PlayerDivision = PlayerDivision.PorDefinir;

  constructor(
    private playerSvc: PlayerService,
    private snackBar: MatSnackBar,
    private auth: Auth,
    private router: Router,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
    this.loadDivisionFromFirestore();
  }

  private async loadDivisionFromFirestore() {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(this.firestore, `usersLogRegistration/${user.uid}`);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        this.playerDivision = data['playerDivision'] || PlayerDivision.PorDefinir;
      }
    } catch (error) {
      console.error('Error loading division:', error);
    }
  }

  private setupAuthListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      // console.log('AUTH_STATE_CHANGED - USUARIO RECIBIDO:', user);
      this.currentUserUid = user?.uid || null;
      // console.log('CURRENT_USER_UID ACTUALIZADO:', this.currentUserUid);
      
      if (!this.currentUserUid) {
        // console.log('🚨 [COMPONENTE] REDIRIGIENDO A LOGIN');
        this.router.navigate(['/login']);
      } else {
        // console.log('🔄 [COMPONENTE] CARGANDO JUGADORES');
        this.loadPlayers();
      }
    });
  }

  private loadPlayers(): void {
    this.subscription = this.playerSvc.getPlayers().subscribe({
      next: (players) => {
        this.players = players;
        // console.log('Jugadores obtenidos:', this.players);
      },
      error: (error) => {
        console.error('Error al obtener jugadores:', error);
        this.showSnackbar('❌ Error al cargar jugadores', 'error');
      }
    });
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

  async onSubmit(form: NgForm): Promise<void> {
  if (form.valid && this.currentUserUid) {
    this.isLoading = true;

    const mmrValue = Number(form.value.mmr) || 0;
    const { medal, medalImage } = this.calculateMedalAndImage(mmrValue);

    const newPlayer: Player = {
      uid: this.currentUserUid,
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
      availability: PlayerAvailability.Available,
      rolUser: this.userRole,
      playerDivision: this.playerDivision,
      registrationDate: new Date(),
      socialMedia: {
        twitch: form.value.twitch || '',
        youtube: form.value.youtube || '',
        kick: form.value.kick || '',
        twitter: form.value.twitter || '',
        discord: form.value.discord || '',
        instagram: form.value.instagram || '',
        facebook: form.value.facebook || '',
        tiktok: form.value.tiktok || ''
      },
      matches: []
    };

    try {
      // 1. Guardar el jugador en la colección principal
      await this.playerSvc.addPlayer(newPlayer).toPromise();

      // 2. Actualizar el registro en usersLogRegistration para marcar como completado
      const logRef = doc(this.firestore, `usersLogRegistration/${this.currentUserUid}`);
      await updateDoc(logRef, {
        registrationCompleted: true,
        completedAt: new Date().toISOString(),
        playerInfo: { // Podemos guardar información relevante del jugador
          nick: newPlayer.nick,
          mmr: newPlayer.mmr,
          division: newPlayer.playerDivision
        }
      });

      // 3. Limpiar y redirigir
      this.showSnackbar('✅ Registro de jugador completado con éxito', 'success');
      form.resetForm();
      this.selectedAvatar = 'assets/medallas/profile_default.png';
      
      // Limpiar cualquier dato temporal (si aún usas sessionStorage)
      sessionStorage.removeItem('userDivision');
      
      this.router.navigate(['/profile']);

    } catch (error) {
      console.error('Error en el proceso de registro:', error);
      let errorMessage = '❌ Error al completar el registro';
      
      // Mensajes más específicos según el error
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = '❌ No tienes permisos para realizar esta acción';
        } else if (error.message.includes('network-error')) {
          errorMessage = '❌ Error de conexión. Verifica tu internet';
        }
      }
      
      this.showSnackbar(errorMessage, 'error');
    } finally {
      this.isLoading = false;
    }

  } else if (!this.currentUserUid) {
    this.showSnackbar('❌ No hay usuario autenticado', 'error');
  }
}

  private calculateMedalAndImage(mmr: number): { medal: string, medalImage: string } {
    const medalRanges = [
      { name: 'Heraldo 1', min: 1, max: 154, image: 'seasonal-rank-herald-1' },
      { name: 'Heraldo 2', min: 154, max: 308, image: 'seasonal-rank-herald-2' },
      { name: 'Heraldo 3', min: 308, max: 462, image: 'seasonal-rank-herald-3' },
      { name: 'Heraldo 4', min: 462, max: 616, image: 'seasonal-rank-herald-4' },
      { name: 'Heraldo 5', min: 616, max: 770, image: 'seasonal-rank-herald-5' },
      { name: 'Guardián 1', min: 770, max: 924, image: 'seasonal-rank-guardian-1' },
      { name: 'Guardián 2', min: 924, max: 1078, image: 'seasonal-rank-guardian-2' },
      { name: 'Guardián 3', min: 1078, max: 1232, image: 'seasonal-rank-guardian-3' },
      { name: 'Guardián 4', min: 1232, max: 1386, image: 'seasonal-rank-guardian-4' },
      { name: 'Guardián 5', min: 1386, max: 1540, image: 'seasonal-rank-guardian-5' },
      { name: 'Cruzado 1', min: 1540, max: 1694, image: 'seasonal-rank-crusader-1' },
      { name: 'Cruzado 2', min: 1694, max: 1848, image: 'seasonal-rank-crusader-2' },
      { name: 'Cruzado 3', min: 1848, max: 2002, image: 'seasonal-rank-crusader-3' },
      { name: 'Cruzado 4', min: 2002, max: 2156, image: 'seasonal-rank-crusader-4' },
      { name: 'Cruzado 5', min: 2156, max: 2310, image: 'seasonal-rank-crusader-5' },
      { name: 'Arconte 1', min: 2310, max: 2464, image: 'seasonal-rank-archon-1' },
      { name: 'Arconte 2', min: 2464, max: 2618, image: 'seasonal-rank-archon-2' },
      { name: 'Arconte 3', min: 2618, max: 2772, image: 'seasonal-rank-archon-3' },
      { name: 'Arconte 4', min: 2772, max: 2926, image: 'seasonal-rank-archon-4' },
      { name: 'Arconte 5', min: 2926, max: 3080, image: 'seasonal-rank-archon-5' },
      { name: 'Leyenda 1', min: 3080, max: 3234, image: 'seasonal-rank-legend-1' },
      { name: 'Leyenda 2', min: 3234, max: 3388, image: 'seasonal-rank-legend-2' },
      { name: 'Leyenda 3', min: 3388, max: 3542, image: 'seasonal-rank-legend-3' },
      { name: 'Leyenda 4', min: 3542, max: 3696, image: 'seasonal-rank-legend-4' },
      { name: 'Leyenda 5', min: 3696, max: 3850, image: 'seasonal-rank-legend-5' },
      { name: 'Antiguo 1', min: 3850, max: 4004, image: 'seasonal-rank-ancient-1' },
      { name: 'Antiguo 2', min: 4004, max: 4158, image: 'seasonal-rank-ancient-2' },
      { name: 'Antiguo 3', min: 4158, max: 4312, image: 'seasonal-rank-ancient-3' },
      { name: 'Antiguo 4', min: 4312, max: 4466, image: 'seasonal-rank-ancient-4' },
      { name: 'Antiguo 5', min: 4466, max: 4620, image: 'seasonal-rank-ancient-5' },
      { name: 'Divino 1', min: 4620, max: 4820, image: 'seasonal-rank-divine-1' },
      { name: 'Divino 2', min: 4820, max: 5020, image: 'seasonal-rank-divine-2' },
      { name: 'Divino 3', min: 5020, max: 5220, image: 'seasonal-rank-divine-3' },
      { name: 'Divino 4', min: 5220, max: 5420, image: 'seasonal-rank-divine-4' },
      { name: 'Divino 5', min: 5420, max: 5620, image: 'seasonal-rank-divine-5' },
      { name: 'Inmortal', min: 5620, max: 8300, image: 'seasonal-rank-immortal' },
      { name: 'Top 1000 Inmortal', min: 8300, max: 10000, image: 'seasonal-rank-immortal-top-100' },
      { name: 'Top 100 Inmortal', min: 10000, max: 12000, image: 'seasonal-rank-immortal-top-100' },
      { name: 'Top 10 Inmortal', min: 12000, max: Infinity, image: 'seasonal-rank-immortal-top-10' }
    ];

    const foundMedal = medalRanges.find(range => mmr >= range.min && mmr < range.max) || 
                      { name: 'Sin medalla', image: 'rank_icon_0' };

    return {
      medal: foundMedal.name,
      medalImage: `assets/medallas/${foundMedal.image}.png`
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
