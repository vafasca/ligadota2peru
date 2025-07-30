import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material/material.module';
import { NotificationsComponent } from '../shared-components/notifications/notifications.component';
import { ChallengeResponseDialogComponent } from '../shared-components/challenge-response-dialog/challenge-response-dialog.component';
import { ElevatorLoadingComponent } from '../shared-components/elevator-loading/elevator-loading.component';
import { LocalDatePipe } from '../shared-pipe/local-date.pipe';



@NgModule({
  declarations: [NotificationsComponent, ChallengeResponseDialogComponent, NotificationsComponent, ElevatorLoadingComponent, LocalDatePipe],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    MaterialModule,
    NotificationsComponent,
    ElevatorLoadingComponent,
    LocalDatePipe
  ]
})
export class SharedModule { }
