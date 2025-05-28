import { Component } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signOut, sendEmailVerification, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AccessCodeDialogComponent } from 'src/app/modules/homepage/components/access-code-dialog/access-code-dialog.component';

// Lista mejorada de dominios de correo válidos
const VALID_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
  'protonmail.com', 'icloud.com', 'aol.com', 'mail.com',
  'com', 'net', 'org', 'io', 'es', 'co', 'edu', 'gov', 'mx', 'ar'
];
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  isLoading = false;
  errorMessage = '';
  emailExists = false;
  currentEmail = '';
  password = '';
  confirmPassword = '';
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async checkEmail(email: string) {
    if (!email) {
      this.resetEmailField();
      return;
    }
    
    // Validación inmediata del formato
    if (!this.isValidEmail(email)) {
      this.errorMessage = 'Por favor ingresa un correo electrónico válido con un dominio existente';
      this.emailExists = true;
      return;
    }
    
    try {
      const methods = await fetchSignInMethodsForEmail(this.auth, email);
      this.emailExists = methods.length > 0;
      this.currentEmail = email;
      
      if (this.emailExists) {
        this.errorMessage = 'Este correo ya está registrado. Por favor, usa otro.';
      } else {
        this.errorMessage = '';
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      this.errorMessage = 'Error al verificar el correo. Inténtalo de nuevo.';
      this.emailExists = true;
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }
    
    const domainParts = email.split('@')[1].split('.');
    const extension = domainParts.pop()?.toLowerCase() || '';
    const fullDomain = domainParts.join('.') + '.' + extension;
    
    return VALID_EMAIL_DOMAINS.includes(fullDomain) || 
           VALID_EMAIL_DOMAINS.includes(extension);
  }

  checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = 'weak';
      return;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const isLong = password.length >= 8;
    
    if (isLong && hasUpperCase && hasLowerCase && hasNumbers && hasSpecial) {
      this.passwordStrength = 'strong';
    } else if (password.length >= 8 && (hasLowerCase || hasUpperCase) && hasNumbers) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'weak';
    }
  }

  getPasswordStrengthText() {
    switch (this.passwordStrength) {
      case 'strong': return 'FORTALEZA: ALTA';
      case 'medium': return 'FORTALEZA: MEDIA';
      default: return 'FORTALEZA: DÉBIL';
    }
  }

  resetEmailField() {
    this.emailExists = false;
    this.errorMessage = '';
    this.currentEmail = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit(form: NgForm) {
    if (form.invalid || this.emailExists || this.passwordStrength === 'weak') {
      this.errorMessage = 'Por favor completa correctamente todos los campos';
      return;
    }

    const { email, password, confirmPassword } = form.value;
      
    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage = 'Por favor ingresa un correo electrónico válido';
      return;
    }

    // Abrir diálogo de código de acceso antes de proceder con el registro
    const dialogRef = this.dialog.open(AccessCodeDialogComponent, {
      width: '350px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si el código es correcto, proceder con el registro
        this.proceedWithRegistration(email, password);
      } else {
        // Si el código es incorrecto o se cancela, limpiar el formulario
        this.resetForm(form);
      }
    });
  }

  private async proceedWithRegistration(email: string, password: string) {
    this.isLoading = true;

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      // Enviar correo de verificación
      await sendEmailVerification(userCredential.user);

      // Cerrar sesión automáticamente para forzar verificación
      await signOut(this.auth);

      this.showSuccess('¡Registro exitoso! Hemos enviado un correo de verificación');

      // Redirigir a página de espera de verificación
      this.router.navigate(['/login/verificacion'], {
        state: {
          email: email,
          justRegistered: true
        }
      });
    } catch (error) {
      this.isLoading = false;
      this.handleError(error);
    }
  }

  private resetForm(form: NgForm) {
    form.resetForm();
    this.currentEmail = '';
    this.password = '';
    this.confirmPassword = '';
    this.passwordStrength = 'weak';
    this.errorMessage = '';
  }

  private handleError(error: any) {
    console.error('Error en registro:', error);
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        this.errorMessage = 'Este correo ya está registrado. ¿Quieres recuperar tu cuenta?';
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'El formato del correo electrónico no es válido.';
        break;
      case 'auth/weak-password':
        this.errorMessage = 'La contraseña debe tener al menos 6 caracteres con letras y números.';
        break;
      case 'auth/operation-not-allowed':
        this.errorMessage = 'El registro no está habilitado temporalmente.';
        break;
      case 'auth/too-many-requests':
        this.errorMessage = 'Demasiados intentos. Por favor, inténtalo de nuevo más tarde.';
        break;
      default:
        this.errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 6000,
      panelClass: ['snackbar-success'],
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }
}
