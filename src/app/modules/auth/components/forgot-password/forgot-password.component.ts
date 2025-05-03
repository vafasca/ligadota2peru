import { Component } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onSubmit(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const { email } = form.value;
      
      try {
        await sendPasswordResetEmail(this.auth, email);
        this.successMessage = 'Se ha enviado un enlace de recuperación a tu correo electrónico.';
        this.showSuccess('Enlace de recuperación enviado');
      } catch (error) {
        this.isLoading = false;
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  private handleError(error: any) {
    console.error('Error en recuperación de contraseña:', error);
    
    switch (error.code) {
      case 'auth/user-not-found':
        this.errorMessage = 'No existe una cuenta con este correo electrónico.';
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'El correo electrónico no es válido.';
        break;
      case 'auth/too-many-requests':
        this.errorMessage = 'Demasiados intentos. Por favor, inténtalo más tarde.';
        break;
      default:
        this.errorMessage = 'Ocurrió un error al enviar el enlace de recuperación.';
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['snackbar-success'],
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }
}
