import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TournamentRoutingModule } from './tournament-routing.module';
import { TournamentComponent } from './tournament.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    TournamentComponent
  ],
  imports: [
    CommonModule,
    TournamentRoutingModule,
    FormsModule,
  ]
})
export class TournamentModule { }
