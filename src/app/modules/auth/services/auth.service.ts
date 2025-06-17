import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, signOut, sendEmailVerification, User, onAuthStateChanged, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, catchError, switchMap, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Player } from '../../admin/models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );
  
  private authStateReady = false;

  constructor() {
    this.setupAuthStateListener();
  }

  private setupAuthStateListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.authStateReady = true;
      this.currentUserSubject.next(user);
      
      if (user) {
        // console.log('[Auth] Usuario autenticado:', user.email);
        if (!user.emailVerified && !this.isWaitingVerificationPage()) {
          this.router.navigate(['/login/verificacion'], {
            state: { email: user.email }
          });
        }
      } else {
        // console.log('[Auth] Usuario no autenticado');
      }
    });
  }

  private isWaitingVerificationPage(): boolean {
    return this.router.url.includes('verificacion');
  }

  // Obtiene el UID del usuario actual de forma sincrónica
  getCurrentUserId(): string | null {
    return this.currentUserSubject.value?.uid || null;
  }

  // Obtiene el usuario completo de forma sincrónica
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Obtiene el UID como Observable
  getCurrentUserId$(): Observable<string | null> {
    return this.currentUser$.pipe(
      map(user => user?.uid || null)
    );
  }

  /**
   * Verifica si el perfil del jugador existe en Firestore
   */
  async checkPlayerProfileExists(): Promise<boolean> {
    const userId = this.getCurrentUserId();
    if (!userId) return false;

    try {
      const playerDocRef = doc(this.firestore, `players/${userId}`);
      const playerSnapshot = await getDoc(playerDocRef);
      return playerSnapshot.exists();
    } catch (error) {
      // console.error('[Auth] Error verificando perfil:', error);
      return false;
    }
  }

  /**
   * Verifica si el perfil del jugador está completo
   */
  async checkPlayerProfileComplete(): Promise<boolean> {
    const userId = this.getCurrentUserId();
    if (!userId) return false;

    try {
      const playerDocRef = doc(this.firestore, `players/${userId}`);
      const playerSnapshot = await getDoc(playerDocRef);

      if (!playerSnapshot.exists()) return false;

      const playerData = playerSnapshot.data() as Player;
      const requiredFields = ['nick', 'idDota', 'mmr', 'category'];
      return requiredFields.every(field => !!playerData[field as keyof Player]);
    } catch (error) {
      console.error('[Auth] Error verificando perfil completo:', error);
      return false;
    }
  }

  async login(email: string, password: string): Promise<{ 
  success: boolean; 
  needsVerification?: boolean; 
  user?: User; 
  message?: string;
  idDota?: number;
}> {
  try {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      await signOut(this.auth);
      const message = 'Por favor verifica tu correo electrónico antes de iniciar sesión';
      return { 
        success: false, 
        needsVerification: true, 
        user,
        message 
      };
    }
    
    // Obtener el idDota del jugador
    const playerDocRef = doc(this.firestore, `players/${user.uid}`);
    const playerSnapshot = await getDoc(playerDocRef);
    const idDota = playerSnapshot.exists() ? (playerSnapshot.data() as Player).idDota : undefined; // Usar undefined en lugar de null

    return { 
      success: true,
      user,
      idDota
    };
  } catch (error) {
    const message = this.handleLoginError(error);
    return { 
      success: false, 
      message 
    };
  }
}

  private handleLoginError(error: any): string {
    const defaultMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
    
    if (!error?.code) return defaultMessage;
    
    const errorMap: Record<string, string> = {
      'auth/invalid-login-credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
      'auth/invalid-email': 'Correo electrónico no válido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor intenta más tarde.',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/user-token-expired': 'La sesión ha expirado. Por favor inicia sesión nuevamente.'
    };

    return errorMap[error.code] || defaultMessage;
  }

  async register(email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const methods = await fetchSignInMethodsForEmail(this.auth, email);
      if (methods.length > 0) {
        const message = 'Este correo ya está registrado';
        // console.warn('[Auth] ' + message);
        return { 
          success: false, 
          message 
        };
      }

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(this.auth);
      
      const message = '¡Registro exitoso! Por favor verifica tu correo electrónico';
      // console.log('[Auth] ' + message);
      return { 
        success: true, 
        user: userCredential.user, 
        message 
      };
    } catch (error) {
      const message = this.getAuthErrorMessage(error);
      // console.error('[Auth] Error en registro:', error);
      return { 
        success: false, 
        message 
      };
    }
  }

  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
      const message = 'Sesión cerrada correctamente';
      // console.log('[Auth] ' + message);
      return { 
        success: true, 
        message 
      };
    } catch (error) {
      const message = this.getAuthErrorMessage(error);
      // console.error('[Auth] Error al cerrar sesión:', error);
      return { 
        success: false, 
        message 
      };
    }
  }

  async resendVerificationEmail(): Promise<{ success: boolean; message?: string }> {
    const user = this.getCurrentUser();
    if (!user) {
      const message = 'No hay usuario autenticado';
      // console.warn('[Auth] ' + message);
      return { 
        success: false, 
        message 
      };
    }

    try {
      await sendEmailVerification(user);
      const message = 'Correo de verificación reenviado. Revisa tu bandeja de entrada.';
      // console.log('[Auth] ' + message);
      return { 
        success: true, 
        message 
      };
    } catch (error) {
      const message = this.getAuthErrorMessage(error);
      // console.error('[Auth] Error al reenviar verificación:', error);
      return { 
        success: false, 
        message 
      };
    }
  }

  isAuthStateReady(): boolean {
    return this.authStateReady;
  }

  getAuthState(): Observable<User | null> {
    return this.currentUser$;
  }

  checkEmailExists(email: string): Observable<{ exists: boolean; message?: string }> {
    return from(fetchSignInMethodsForEmail(this.auth, email)).pipe(
      map(methods => ({
        exists: methods.length > 0,
        message: methods.length > 0 ? 'El correo ya está registrado' : undefined
      })),
      catchError(error => {
        const message = this.getAuthErrorMessage(error);
        // console.error('[Auth] Error al verificar email:', error);
        return of({ 
          exists: false, 
          message 
        });
      })
    );
  }

  private getAuthErrorMessage(error: any): string {
    if (!error?.code) return 'Ocurrió un error inesperado';
    
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'Correo electrónico no válido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-login-credentials': 'Credenciales inválidas',
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres',
      'auth/requires-recent-login': 'Por favor vuelve a iniciar sesión',
      'auth/too-many-requests': 'Demasiados intentos. Por favor intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/user-token-expired': 'Tu sesión ha expirado'
    };

    return errorMessages[error.code] || 'Ocurrió un error inesperado';
  }
}
