import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { PlayerRegistrationComponent } from './player-registration/player-registration.component';


@NgModule({
  declarations: [
    AdminComponent,
    PlayerRegistrationComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
