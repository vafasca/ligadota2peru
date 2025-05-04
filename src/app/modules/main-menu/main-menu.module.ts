import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainMenuRoutingModule } from './main-menu-routing.module';
import { MainMenuComponent } from './main-menu.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [
    MainMenuComponent,
    LobbyComponent
  ],
  imports: [
    CommonModule,
    MainMenuRoutingModule,
    FormsModule,
    DragDropModule
  ]
})
export class MainMenuModule { }
