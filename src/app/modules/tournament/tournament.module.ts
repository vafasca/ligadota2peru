import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TournamentRoutingModule } from './tournament-routing.module';
import { TournamentComponent } from './tournament.component';
import { FormsModule } from '@angular/forms';
import { SingleEliminationComponent } from './components/single-elimination/single-elimination.component';
import { CreateTounamentComponent } from './components/create-tounament/create-tounament.component';
import { TournamentViewComponent } from './components/tournament-view/tournament-view.component';
import { TournamentTeamsComponent } from './components/tournament-teams/tournament-teams.component';
import { SharedModule } from 'src/app/shared-module/shared.module';
import { FormatRulesComponent } from './components/format-rules/format-rules.component';
import { TeamDialogViewComponent } from './components/team-dialog-view/team-dialog-view.component';


@NgModule({
  declarations: [
    TournamentComponent,
    SingleEliminationComponent,
    CreateTounamentComponent,
    TournamentViewComponent,
    TournamentTeamsComponent,
    FormatRulesComponent,
    TeamDialogViewComponent,
  ],
  imports: [
    CommonModule,
    TournamentRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class TournamentModule { }
