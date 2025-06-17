import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';




@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onSubmit(form: NgForm) {
  if (form.valid) {
    this.isLoading = true;
    this.errorMessage = '';
    
    const { email, password } = form.value;
    
    try {
      const result = await this.authService.login(email, password);
      
      if (result.success) {
        this.showSuccess('Inicio de sesión exitoso');
        // Navegar al perfil con el idDota
        if (result.idDota) {
          this.router.navigate(['/profile', result.idDota]);
        } else {
          this.router.navigate(['/completar_registro']);
        }
      } else if (result.needsVerification) {
        this.router.navigate(['/login/verificacion'], { 
          state: { email: email } 
        });
        this.showError(result.message || 'Por favor verifica tu correo electrónico');
      } else {
        this.showError(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      this.showError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      this.isLoading = false;
    }
  } else {
    this.showError('Por favor completa todos los campos correctamente');
  }
}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToRegister(): void {
    this.router.navigate(['/login/registro']);
  }

  resetPassword(): void {
    this.router.navigate(['/login/recuperar-contrasena']);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-success'],
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }

  goTohome(): void {
    this.router.navigate(['/']);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['snackbar-error'],
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }
}
