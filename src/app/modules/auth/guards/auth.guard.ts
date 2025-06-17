import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree  } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';
import { firstValueFrom, Observable } from 'rxjs';
import { PlayerService } from '../../admin/services/player.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const playerService = inject(PlayerService);

  return new Promise<boolean | UrlTree>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        // Verificar coincidencia de idDota si está en la ruta
        const idDotaFromRoute = route.paramMap.get('idDota');
        if (idDotaFromRoute) {
          const player = await firstValueFrom(playerService.getPlayer(user.uid));
          if (player?.idDota !== +idDotaFromRoute) {
            resolve(router.createUrlTree(['/profile', player?.idDota || '']));
            return;
          }
        }
        resolve(true);
      } else {
        resolve(router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        }));
      }
    });
  });
};
