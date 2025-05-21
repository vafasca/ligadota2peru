import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatchmakingRoutingModule } from './matchmaking-routing.module';
import { MatchmakingComponent } from './matchmaking.component';
import { BuscarRivalesComponentComponent } from './components/buscar-rivales-component/buscar-rivales-component.component';


@NgModule({
  declarations: [
    MatchmakingComponent,
    BuscarRivalesComponentComponent
  ],
  imports: [
    CommonModule,
    MatchmakingRoutingModule
  ]
})
export class MatchmakingModule { }
