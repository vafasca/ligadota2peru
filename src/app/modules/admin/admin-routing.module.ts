import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { authGuard } from '../auth/guards/auth.guard';
import { emailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { PlayerRegistrationComponent } from './player-registration/player-registration.component';
import { completeRegistrationGuard } from '../auth/guards/complete-registration.guard';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { adminGuard } from './guards/admin.guard';

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
  {
    path: 'admin-panel',
    component: AdminPanelComponent,
    canActivate: [adminGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
