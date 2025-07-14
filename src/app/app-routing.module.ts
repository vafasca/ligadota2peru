import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'completar_registro',
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./modules/user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'lobby',
    loadChildren: () =>
      import('./modules/main-menu/main-menu.module').then(
        (m) => m.MainMenuModule
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },

  {
    path: 'matchmaking',
    loadChildren: () =>
      import('./modules/matchmaking/matchmaking.module').then(
        (m) => m.MatchmakingModule
      ),
  },

  {
    path: '',
    loadChildren: () =>
      import('./modules/homepage/homepage.module').then(
        (m) => m.HomepageModule
      ),
  },
  {
    path: 'tournament',
    loadChildren: () =>
      import('./modules/tournament/tournament.module').then(
        (m) => m.TournamentModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
