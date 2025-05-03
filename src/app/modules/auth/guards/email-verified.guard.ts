import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export const emailVerifiedGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const user = auth.currentUser;

  if (!user) {
    return of(router.createUrlTree(['/login']));
  }

  return from(user.reload()).pipe(
    map(() => {
      return user.emailVerified 
        ? true 
        : router.createUrlTree(['/waiting-verification'], {
            queryParams: { email: user.email }
          });
    }),
    catchError(error => {
      console.error('Error:', error);
      return of(router.createUrlTree(['/error']));
    })
  );
};
