import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { authGuard } from '../auth/guards/auth.guard';
import { emailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { PlayerRegistrationComponent } from './player-registration/player-registration.component';
import { completeRegistrationGuard } from '../auth/guards/complete-registration.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [authGuard, completeRegistrationGuard],
  },
  {
    path: 'completarregistro',
    component: PlayerRegistrationComponent,
    canActivate: [authGuard, completeRegistrationGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
