import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  CollectionReference,
  DocumentData,
  FirestoreError
} from '@angular/fire/firestore';
import { Player } from '../models/jugador.model';
import { catchError, from, Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private readonly playersCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.playersCollection = collection(this.firestore, 'players');
  }

  /**
   * Adds a new player to Firestore database
   * @param player Player data to be added
   * @returns Observable with the document reference
   * @throws FirestoreError if operation fails
   */
  addPlayer(player: Player): Observable<DocumentData> {
    return from(addDoc(this.playersCollection, player)).pipe(
      catchError((error: FirestoreError) => {
        console.error('Error adding player:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

    /**
   * Translates Firestore error codes to user-friendly messages
   * @param error Firestore error
   * @returns Human-readable error message
   */
    private getFirestoreErrorMessage(error: FirestoreError): string {
      switch (error.code) {
        case 'permission-denied':
          return 'You don\'t have permission to perform this operation.';
        case 'unavailable':
          return 'Network is unavailable. Please check your connection.';
        default:
          return 'An unknown error occurred while saving player data.';
      }
    }
}
