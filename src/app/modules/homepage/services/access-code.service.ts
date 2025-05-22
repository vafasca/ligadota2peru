import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore, getDoc, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { ReCaptchaV3Service } from 'ng-recaptcha';

@Injectable({
  providedIn: 'root'
})
export class AccessCodeService {

  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 horas en ms

  constructor(
    private firestore: Firestore,
    private recaptchaService: ReCaptchaV3Service
  ) { }

  async validateAndDeleteCode(code: string): Promise<{ success: boolean; message?: string }> {
    try {
      // 1. Verificar reCAPTCHA primero
      const token = await this.recaptchaService.execute('validate_code').toPromise();
      
      // 2. Obtener IP del cliente (simplificado - en producción usa un backend)
      const ip = await this.getClientIp(); 

      // 3. Verificar bloqueo por IP
      const isBlocked = await this.checkIpBlock(ip);
      if (isBlocked) {
        return { 
          success: false, 
          message: 'Acceso bloqueado por 24 horas (múltiples intentos fallidos)' 
        };
      }

      // 4. Validar código en Firestore
      const codeRef = doc(this.firestore, `accessCodes/${code}`);
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
        // await deleteDoc(codeRef);
        await this.resetAttempts(ip);
        return { success: true };
      } else {
        // 5. Registrar intento fallido
        await this.recordFailedAttempt(ip);
        return { 
          success: false, 
          message: 'Código inválido' 
        };
      }
    } catch (error) {
      console.error('Error:', error);
      return { 
        success: false, 
        message: 'Error en la validación' 
      };
    }
  }

  private async checkIpBlock(ip: string): Promise<boolean> {
    const blockRef = doc(this.firestore, `blockedIPs/${ip}`);
    const blockSnap = await getDoc(blockRef);
    
    if (!blockSnap.exists()) return false;

    const blockData = blockSnap.data();
    const now = new Date();
    const expiresAt = blockData!['expiresAt']?.toDate();

    return expiresAt > now;
  }

  private async recordFailedAttempt(ip: string): Promise<void> {
    const attemptsRef = doc(this.firestore, `loginAttempts/${ip}`);
    const attemptsSnap = await getDoc(attemptsRef);
    
    const currentAttempts = attemptsSnap.exists() ? attemptsSnap.data()!['count'] : 0;
    const newCount = currentAttempts + 1;

    await setDoc(attemptsRef, {
      count: newCount,
      lastAttempt: serverTimestamp(),
      ip: ip
    }, { merge: true });

    // Bloquear si excede el máximo
    if (newCount >= this.MAX_ATTEMPTS) {
      await this.blockIp(ip);
    }
  }

  private async blockIp(ip: string): Promise<void> {
    const blockRef = doc(this.firestore, `blockedIPs/${ip}`);
    await setDoc(blockRef, {
      blockedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + this.BLOCK_DURATION)
    });
  }

  private async resetAttempts(ip: string): Promise<void> {
    const attemptsRef = doc(this.firestore, `loginAttempts/${ip}`);
    await deleteDoc(attemptsRef);
  }

  // Método simplificado para obtener IP (en producción usa un backend)
  private async getClientIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}
