import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  CollectionReference,
  DocumentData,
  FirestoreError,
  onSnapshot,
  QuerySnapshot,
  getDocs
} from '@angular/fire/firestore';
import { Player } from '../models/jugador.model';
import { catchError, from, Observable, tap, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private playersCollection: CollectionReference<DocumentData>;
  //private tarifasCollection: any; // Almacena la referencia a la colección de tarifas.

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
   * Adds a match to the subcollection `matches` of a specific player
   * @param playerId ID of the player
   * @param matchId Match ID to be added
   * @returns Observable with the operation result
   * @throws FirestoreError if operation fails
   */
  addMatch(playerId: string, matchId: string): Observable<DocumentData> {
    // Reference to the subcollection `matches` inside the player document
    const matchesCollection = collection(this.firestore, `players/${playerId}/matches`);
    return from(addDoc(matchesCollection, { matchId })).pipe(
      catchError((error: FirestoreError) => {
        console.error('Error adding match:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  getPlayers(): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(
        this.playersCollection,
        async (snapshot: QuerySnapshot) => {
          const playersWithMatches = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const playerData = { id: doc.id, ...doc.data() };
  
              // Referencia a la subcolección "matches"
              const matchesCollection = collection(this.firestore, `players/${doc.id}/matches`);
              const matchesSnapshot = await getDocs(matchesCollection);
              const matches = matchesSnapshot.docs.map(matchDoc => ({
                id: matchDoc.id,
                ...matchDoc.data()
              }));
  
              return { ...playerData, matches };
            })
          );
  
          observer.next(playersWithMatches);
        },
        (error) => {
          console.error('Error al escuchar cambios en jugadores:', error);
          observer.error(error);
        }
      );
  
      return () => unsubscribe();
    });
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
