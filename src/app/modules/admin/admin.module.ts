import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { PlayerRegistrationComponent } from './player-registration/player-registration.component';
import { FormsModule } from '@angular/forms';
import { TeamOrganizerComponent} from './team-organizer/team-organizer.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MaterialModule } from 'src/app/material/material/material.module';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TeamsPerTournamentComponent } from './components/teams-per-tournament/teams-per-tournament.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { TeamNotesDialogComponent } from './components/team-notes-dialog/team-notes-dialog.component';
import { SharedModule } from 'src/app/shared-module/shared.module';

@NgModule({
  declarations: [
    AdminComponent,
    PlayerRegistrationComponent,
    TeamOrganizerComponent,
    AdminPanelComponent,
    TeamsPerTournamentComponent,
    ConfirmationDialogComponent,
    TeamNotesDialogComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    DragDropModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AdminModule { }
