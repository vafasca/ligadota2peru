import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { PlayerProfileComponent } from './components/player-profile/player-profile.component';

const routes: Routes = [
  { path: '', component: UserComponent },
  { path: 'profile', component: PlayerProfileComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
