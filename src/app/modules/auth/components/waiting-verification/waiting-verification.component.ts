import { Component } from '@angular/core';
import { Auth, onAuthStateChanged, sendEmailVerification, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-waiting-verification',
  templateUrl: './waiting-verification.component.html',
  styleUrls: ['./waiting-verification.component.css']
})
export class WaitingVerificationComponent {
  email: string = '';
  private currentUser: User | null = null;
  private authSubscription: Subscription;

  constructor(
    private auth: Auth,
    private router: Router,
    private location: Location
  ) {
    const state = this.location.getState() as { email: string };
    this.email = state?.email || this.auth.currentUser?.email || '';

    this.authSubscription = new Subscription();
    this.setupAuthListener();
  }

  private setupAuthListener(): void {
    const auth$ = new Observable<User | null>(subscriber => {
      return onAuthStateChanged(this.auth, user => {
        subscriber.next(user);
      });
    });

    this.authSubscription = auth$.subscribe(user => {
      this.currentUser = user;
      if (user?.emailVerified) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  async resendVerification(): Promise<void> {
    if (!this.currentUser) {
      alert('No hay usuario autenticado');
      return;
    }

    try {
      await sendEmailVerification(this.currentUser);
      alert('¡Correo de verificación reenviado! Revisa tu bandeja de entrada.');
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      alert('Error al reenviar el correo de verificación');
    }
  }

  async checkVerification(): Promise<void> {
    if (!this.currentUser) {
      alert('Por favor inicia sesión primero');
      return;
    }

    try {
      await this.currentUser.reload();
      if (this.currentUser.emailVerified) {
        this.router.navigate(['/dashboard']);
      } else {
        alert('Tu correo aún no ha sido verificado. Por favor revisa tu bandeja de entrada.');
      }
    } catch (error) {
      console.error('Error al verificar estado:', error);
      alert('Error al verificar el estado de verificación');
    }
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }
}
