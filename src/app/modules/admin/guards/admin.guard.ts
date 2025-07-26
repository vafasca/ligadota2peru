import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { PlayerService } from '../services/player.service';
import { catchError, map, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const playerService = inject(PlayerService);
  const router = inject(Router);

  return new Observable<boolean>(observer => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        router.navigate(['/login']);
        observer.next(false);
        observer.complete();
        return;
      }

      playerService.getPlayer(user.uid).pipe(
        take(1),
        map(player => {
          const isAdmin = player?.rolUser === 'admin' || player?.rolUser === 'subadmin';
          if (!isAdmin) {
            router.navigate(['/lobby']);
          }
          return isAdmin;
        }),
        catchError(error => {
          console.error('Error in admin guard:', error);
          router.navigate(['/lobby']);
          return of(false);
        })
      ).subscribe(result => {
        observer.next(result);
        observer.complete();
      });
    });

    return () => unsubscribe();
  });
};
