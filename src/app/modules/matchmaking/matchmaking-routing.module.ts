import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatchmakingComponent } from './matchmaking.component';

const routes: Routes = [{ path: '', component: MatchmakingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MatchmakingRoutingModule { }
