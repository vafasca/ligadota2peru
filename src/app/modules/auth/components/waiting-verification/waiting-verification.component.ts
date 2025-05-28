import { Component } from '@angular/core';
import { Auth, onAuthStateChanged, sendEmailVerification, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-waiting-verification',
  templateUrl: './waiting-verification.component.html',
  styleUrls: ['./waiting-verification.component.css']
})
export class WaitingVerificationComponent {
    countdown: number = 10; // Aumentado a 10 segundos
  private timerSubscription!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Temporizador aumentado a 10 segundos
    this.timerSubscription = timer(1000, 1000).subscribe(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        this.goToLogin();
      }
    });
  }

  goToLoginNow(): void {
    this.timerSubscription.unsubscribe();
    this.goToLogin();
  }

  goToLoginWithCredentials(): void {
    this.timerSubscription.unsubscribe();
    this.router.navigate(['/login'], {
      state: { showCredentialsForm: true }
    });
  }

  private goToLogin(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
