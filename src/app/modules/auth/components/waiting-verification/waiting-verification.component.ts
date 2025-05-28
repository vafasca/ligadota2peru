import { Component } from '@angular/core';
import { Auth, onAuthStateChanged, sendEmailVerification, User } from '@angular/fire/auth';
import { NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-waiting-verification',
  templateUrl: './waiting-verification.component.html',
  styleUrls: ['./waiting-verification.component.css']
})
export class WaitingVerificationComponent {
  countdown: number = 30;
  email: string = '';
  private timerSubscription!: Subscription;
  private authSubscription!: Subscription;
  private readonly STORAGE_KEY = 'pendingVerification';

  constructor(
    private router: Router,
    private location: Location,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.checkNavigationState();
    this.setupAuthListener();
    this.startCountdown();
  }

  private checkNavigationState(): void {
    const state = this.location.getState() as {
      email?: string;
      fromRegistration?: boolean;
    };

    // Verificar acceso válido
    if (!state?.fromRegistration && !sessionStorage.getItem(this.STORAGE_KEY)) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar email y guardar en sessionStorage
    if (state?.email) {
      this.email = state.email;
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        email: state.email,
        timestamp: new Date().getTime()
      }));
    } else {
      // Recuperar de sessionStorage si se recargó la página
      const storedData = sessionStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        try {
          const { email } = JSON.parse(storedData);
          this.email = email;
        } catch {
          this.handleInvalidSession();
        }
      } else {
        this.handleInvalidSession();
      }
    }
  }

  private setupAuthListener(): void {
    this.authSubscription = new Observable<User | null>(subscriber => {
      return onAuthStateChanged(this.auth, user => {
        subscriber.next(user);
      });
    }).subscribe(user => {
      if (user?.emailVerified) {
        this.cleanupAndNavigate(['/dashboard']);
      }
    });
  }

  private startCountdown(): void {
    this.timerSubscription = timer(1000, 1000).subscribe(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        this.goToLogin();
      }
    });
  }

  goToLoginNow(): void {
    this.cleanupAndNavigate(['/login']);
  }

  goToLoginWithCredentials(): void {
    const extras: NavigationExtras = {
      state: {
        showCredentialsForm: true,
        prefilledEmail: this.email
      }
    };
    this.cleanupAndNavigate(['/login'], extras);
  }

  private handleInvalidSession(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login'], {
      state: { sessionExpired: true }
    });
  }

  private cleanupAndNavigate(commands: any[], extras?: NavigationExtras): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.timerSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.router.navigate(commands, extras);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }
}
