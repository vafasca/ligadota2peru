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

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatSnackBarModule,

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
