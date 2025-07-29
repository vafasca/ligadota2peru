import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material/material.module';
import { NotificationsComponent } from '../shared-components/notifications/notifications.component';
import { ChallengeResponseDialogComponent } from '../shared-components/challenge-response-dialog/challenge-response-dialog.component';
import { ElevatorLoadingComponent } from '../shared-components/elevator-loading/elevator-loading.component';



@NgModule({
  declarations: [NotificationsComponent, ChallengeResponseDialogComponent, NotificationsComponent, ElevatorLoadingComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    MaterialModule,
    NotificationsComponent,
    ElevatorLoadingComponent
  ]
})
export class SharedModule { }
