import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material/material.module';
import { NotificationsComponent } from '../shared-components/notifications/notifications.component';
import { ChallengeResponseDialogComponent } from '../shared-components/challenge-response-dialog/challenge-response-dialog.component';



@NgModule({
  declarations: [NotificationsComponent, ChallengeResponseDialogComponent, NotificationsComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    MaterialModule,
    NotificationsComponent,
  ]
})
export class SharedModule { }
