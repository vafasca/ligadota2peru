import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { PlayerProfileComponent } from './components/player-profile/player-profile.component';
import { authGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  { path: '', component: UserComponent },
  {
    path: 'profile/:idDota',
    component: PlayerProfileComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
