import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const registrationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Verificar múltiples indicadores de registro exitoso
  const navigation = router.getCurrentNavigation();
  const fromRegistration = navigation?.extras?.state?.['fromRegistration'];
  const registrationComplete = sessionStorage.getItem('registrationComplete');
  const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');
  
  if (fromRegistration || registrationComplete || pendingEmail) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};
