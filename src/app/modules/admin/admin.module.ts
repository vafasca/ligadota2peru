import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { PlayerRegistrationComponent } from './player-registration/player-registration.component';
import { FormsModule } from '@angular/forms';
import { TeamOrganizerComponent} from './team-organizer/team-organizer.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MaterialModule } from 'src/app/material/material/material.module';


@NgModule({
  declarations: [
    AdminComponent,
    PlayerRegistrationComponent,
    TeamOrganizerComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    DragDropModule,
    MaterialModule
  ]
})
export class AdminModule { }
