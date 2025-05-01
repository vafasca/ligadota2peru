import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { MaterialModule } from 'src/app/material/material/material.module';
import { PlayerProfileComponent } from './components/player-profile/player-profile.component';


@NgModule({
  declarations: [
    UserComponent,
    PlayerProfileComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    MaterialModule
  ]
})
export class UserModule { }
