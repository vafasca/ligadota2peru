import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { AccessCodeService } from '../../services/access-code.service';
import { PlayerRole } from 'src/app/modules/admin/models/jugador.model';

@Component({
  selector: 'app-access-code-dialog',
  templateUrl: './access-code-dialog.component.html',
  styleUrls: ['./access-code-dialog.component.css']
})
export class AccessCodeDialogComponent {
accessForm: FormGroup;
  errorMessage: string = '';
  attempts: number = 0;
  maxAttempts: number = 3;
  isLocked: boolean = false;
  lockTime: number = 30;
  countdown: number = 0;
  private countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private accessCodeService: AccessCodeService,
    public dialogRef: MatDialogRef<AccessCodeDialogComponent>
  ) {
    this.accessForm = this.fb.group({
      accessCode: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  // access-code-dialog.component.ts
async verifyCode() {
  if (this.isLocked) return;

  const enteredCode = this.accessForm.value.accessCode;
  
  try {
    const validationResult = await this.accessCodeService.validateAndDeleteCode(enteredCode);
    
    if (!validationResult.found) {
      throw new Error('Código inválido');
    }

    // Devuelve el estado de éxito y la división encontrada
    this.dialogRef.close({
      success: true,
      division: validationResult.division,
      accessCode: enteredCode
    });
  } catch (error) {
    this.handleInvalidCode();
  }
}

  private handleInvalidCode() {
    this.attempts++;
    this.errorMessage = 'Código incorrecto o ya utilizado. Intenta nuevamente.';
    
    if (this.attempts >= this.maxAttempts) {
      this.lockAccess();
    }
  }

  private lockAccess() {
    this.isLocked = true;
    this.countdown = this.lockTime;
    this.errorMessage = `Demasiados intentos. Espera ${this.lockTime} segundos.`;
    
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      this.errorMessage = `Demasiados intentos. Espera ${this.countdown} segundos.`;
      
      if (this.countdown <= 0) {
        this.unlockAccess();
      }
    }, 1000);
  }

  private unlockAccess() {
    clearInterval(this.countdownInterval);
    this.isLocked = false;
    this.attempts = 0;
    this.errorMessage = '';
    this.accessForm.reset();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
