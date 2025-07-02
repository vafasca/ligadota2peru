import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { MaterialModule } from 'src/app/material/material/material.module';
import { PlayerProfileComponent } from './components/player-profile/player-profile.component';
import { SharedModule } from 'src/app/shared-module/shared.module';


@NgModule({
  declarations: [
    UserComponent,
    PlayerProfileComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    MaterialModule,
    SharedModule
  ]
})
export class UserModule { }
