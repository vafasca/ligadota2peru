import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged  } from '@angular/fire/auth';
import { PlayerService } from '../../admin/services/player.service';
import { catchError, from, map, Observable, of, switchMap, tap } from 'rxjs';

export const completeRegistrationGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const playerService = inject(PlayerService);

  // Convertimos el callback de Firebase en un Observable
  return new Observable<boolean | import('@angular/router').UrlTree>(subscriber => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        subscriber.next(router.createUrlTree(['/login']));
        subscriber.complete();
        return;
      }

      // Obtener el perfil completo del jugador
      playerService.getPlayer(user.uid).pipe(
        switchMap(player => {
          if (!player) {
            // No existe perfil, permitir acceso (para completar registro)
            return of(true);
          }
          
          // Si existe perfil, redirigir a su perfil con idDota
          if (player.idDota) {
            console.log('Redirigiendo al perfil con idDota:', player.idDota);
            return of(router.createUrlTree(['/profile', player.idDota]));
          } else {
            // Caso raro donde no tiene idDota (manejar según tu lógica)
            return of(router.createUrlTree(['/profile']));
          }
        }),
        catchError(error => {
          console.error('Error verificando perfil:', error);
          return of(router.createUrlTree(['/error']));
        })
      ).subscribe(result => {
        subscriber.next(result);
        subscriber.complete();
      });
    });

    return () => unsubscribe();
  });
};
