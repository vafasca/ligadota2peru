import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TournamentComponent } from './tournament.component';
import { TournamentViewComponent } from './components/tournament-view/tournament-view.component';

const routes: Routes = [
  { path: '', component: TournamentComponent },
  { path: 'tournament/:id', component: TournamentViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TournamentRoutingModule { }
