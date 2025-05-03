import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree  } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean | UrlTree>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? true : router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      }));
    });
  });
};
