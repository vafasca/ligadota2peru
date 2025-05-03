import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged  } from '@angular/fire/auth';
import { PlayerService } from '../../admin/services/player.service';
import { catchError, from, map, Observable, of, tap } from 'rxjs';

export const completeRegistrationGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const playerService = inject(PlayerService);

  // Convertimos el callback de Firebase en un Observable
  return new Observable<boolean | import('@angular/router').UrlTree>(subscriber => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirigir si no hay usuario autenticado
        subscriber.next(router.createUrlTree(['/login']));
        subscriber.complete();
        return;
      }

      // Verificar el perfil del jugador
      playerService.checkPlayerExists(user.uid).pipe(
        map(playerExists => {
          return playerExists 
            ? router.createUrlTree(['/user']) // Redirigir si existe perfil
            : true; // Permitir acceso si no existe
        }),
        catchError(error => {
          console.error('Error verificando perfil:', error);
          return of(router.createUrlTree(['/error'])); // Redirigir a error
        })
      ).subscribe(result => {
        subscriber.next(result);
        subscriber.complete();
      });
    });

    return () => unsubscribe();
  });
};
