import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainMenuRoutingModule } from './main-menu-routing.module';
import { MainMenuComponent } from './main-menu.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CreateTeamDialogComponent } from './components/create-team-dialog/create-team-dialog.component';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterByRolePipePipe } from './pipes/filter-by-role-pipe.pipe';
import { AddPlayerDialogComponent } from './components/add-player-dialog/add-player-dialog.component';
import { MatListModule } from '@angular/material/list';
import { SharedModule } from 'src/app/shared-module/shared.module';

@NgModule({
  declarations: [
    MainMenuComponent,
    LobbyComponent,
    CreateTeamDialogComponent,
    FilterByRolePipePipe,
    AddPlayerDialogComponent
  ],
  imports: [
    CommonModule,
    MainMenuRoutingModule,
    FormsModule,
    DragDropModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatListModule,
    SharedModule
  ]
})
export class MainMenuModule { }
