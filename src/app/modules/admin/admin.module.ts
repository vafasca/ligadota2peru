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
import { DashboardComponent } from './components/admin-panel/dashboard/dashboard.component';
import { TournamentsComponent } from './components/admin-panel/tournaments/tournaments.component';
import { MatchesComponent } from './components/admin-panel/matches/matches.component';
import { UsersComponent } from './components/admin-panel/users/users.component';
import { ReportsComponent } from './components/admin-panel/reports/reports.component';
import { CreateTournamentModalComponent } from './components/admin-panel/shared/create-tournament-modal/create-tournament-modal.component';
import { SidebarComponent } from './components/admin-panel/shared/sidebar/sidebar.component';
import { EditUserDialogComponent } from './components/admin-panel/users/edit-user-dialog/edit-user-dialog.component';
import { ConfirmationDialogUserComponent } from './components/admin-panel/users/confirmation-dialog-user/confirmation-dialog-user.component';
import { TruncatePipe } from './pipes/truncate.pipe';

@NgModule({
  declarations: [
    AdminComponent,
    PlayerRegistrationComponent,
    TeamOrganizerComponent,
    AdminPanelComponent,
    TeamsPerTournamentComponent,
    ConfirmationDialogComponent,
    TeamNotesDialogComponent,
    DashboardComponent,
    TournamentsComponent,
    MatchesComponent,
    UsersComponent,
    ReportsComponent,
    CreateTournamentModalComponent,
    SidebarComponent,
    EditUserDialogComponent,
    ConfirmationDialogUserComponent,
    TruncatePipe
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
