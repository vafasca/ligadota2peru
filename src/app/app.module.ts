import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// 🔥 Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth, initializeAuth, browserLocalPersistence } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { ElevatorLoadingComponent } from './shared-components/elevator-loading/elevator-loading.component';
import { UserRoutingModule } from './modules/user/user-routing.module';
import { NotificationsComponent } from './shared-components/notifications/notifications.component';
import { ChallengeResponseDialogComponent } from './shared-components/challenge-response-dialog/challenge-response-dialog.component';
import { SharedModule } from './shared-module/shared.module';
import { ConfirmChallengeDialogComponent } from './shared-components/confirm-challenge-dialog/confirm-challenge-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    ElevatorLoadingComponent,
    ConfirmChallengeDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    UserRoutingModule,
    MatButtonModule,
    MatSnackBarModule,
    SharedModule,

    // Inicialización de Firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),

    // Firestore Database
    provideFirestore(() => getFirestore()),

    provideAuth(() => {
      const app = initializeApp(environment.firebaseConfig); // Primero la app
      const auth = initializeAuth(app, {
        persistence: browserLocalPersistence
      });
      return auth;
    }),

    // Storage (opcional)
    provideStorage(() => getStorage()),

    BrowserAnimationsModule, // para usar Firestore
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
