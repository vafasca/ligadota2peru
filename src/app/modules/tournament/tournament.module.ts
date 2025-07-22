import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TournamentRoutingModule } from './tournament-routing.module';
import { TournamentComponent } from './tournament.component';
import { FormsModule } from '@angular/forms';
import { SingleEliminationComponent } from './components/single-elimination/single-elimination.component';


@NgModule({
  declarations: [
    TournamentComponent,
    SingleEliminationComponent
  ],
  imports: [
    CommonModule,
    TournamentRoutingModule,
    FormsModule,
  ]
})
export class TournamentModule { }
