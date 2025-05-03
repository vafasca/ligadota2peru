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
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  updateDoc
} from '@angular/fire/firestore';
import { Player } from '../models/jugador.model';
import { catchError, from, map, Observable, of, tap, throwError } from 'rxjs';
import { Match } from '../models/match.model';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private playersCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.playersCollection = collection(this.firestore, 'players');
  }

  /**
   * Adds or updates a player in Firestore using UID as document ID
   * @param player Player data to be added/updated
   * @returns Observable with void when complete
   */
  addPlayer(player: Player): Observable<void> {
    if (!player.uid) {
      return throwError(() => new Error('Player UID is required'));
    }

    const playerDocRef = doc(this.firestore, `players/${player.uid}`);
    return from(setDoc(playerDocRef, player)).pipe(
      catchError((error: FirestoreError) => {
        console.error('Error adding player:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  /**
   * Updates player data
   * @param uid Player UID
   * @param data Partial player data to update
   * @returns Observable with void when complete
   */
  updatePlayer(uid: string, data: Partial<Player>): Observable<void> {
    const playerDocRef = doc(this.firestore, `players/${uid}`);
    return from(updateDoc(playerDocRef, data)).pipe(
      catchError((error: FirestoreError) => {
        console.error('Error updating player:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  /**
   * Gets a player by UID
   * @param uid Player UID
   * @returns Observable with Player or null if not found
   */
  getPlayer(uid: string): Observable<Player | null> {
    const playerDocRef = doc(this.firestore, `players/${uid}`);
    return from(getDoc(playerDocRef)).pipe(
      map(snapshot => {
        console.log('Player snapshot:', snapshot.exists());
        return snapshot.exists() ? snapshot.data() as Player : null;
      }),
      catchError((error: FirestoreError) => {
        console.error('Error getting player:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  /**
   * Gets all players with real-time updates
   * @returns Observable with array of Players
   */
  getPlayers(): Observable<Player[]> {
    return new Observable<Player[]>(observer => {
      const unsubscribe = onSnapshot(
        this.playersCollection,
        (snapshot) => {
          const players = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
          } as Player));
          observer.next(players);
        },
        (error) => {
          console.error('Error listening to players:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * Gets players by category
   * @param category Category to filter by
   * @returns Observable with array of Players
   */
  getPlayersByCategory(category: string): Observable<Player[]> {
    const q = query(this.playersCollection, where('category', '==', category));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as Player))),
      catchError((error: FirestoreError) => {
        console.error('Error getting players by category:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  /**
   * Adds a match to player's matches subcollection
   * @param playerId Player UID
   * @param match Match data to add
   * @returns Observable with void when complete
   */
  addPlayerMatch(playerId: string, match: Match): Observable<void> {
    const matchDocRef = doc(this.firestore, `players/${playerId}/matches/${match.id}`);
    return from(setDoc(matchDocRef, match)).pipe(
      catchError((error: FirestoreError) => {
        console.error('Error adding match:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  /**
   * Gets all matches for a player with real-time updates
   * @param playerId Player UID
   * @returns Observable with array of Matches
   */
  getPlayerMatches(playerId: string): Observable<Match[]> {
    const matchesCollection = collection(this.firestore, `players/${playerId}/matches`);
    return new Observable<Match[]>(observer => {
      const unsubscribe = onSnapshot(
        matchesCollection,
        (snapshot) => {
          const matches = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Match));
          observer.next(matches);
        },
        (error) => {
          console.error('Error listening to matches:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * Checks if a player document exists for the given UID
   * @param uid User UID to check
   * @returns Observable with boolean indicating existence
   */
  checkPlayerExists(uid: string): Observable<boolean> {
    console.log('Checking player exists for UID:', uid);
    const playerDocRef = doc(this.firestore, `players/${uid}`);
    return from(getDoc(playerDocRef)).pipe(
      map(snapshot => {
        console.log('Player exists check result:', snapshot.exists());
        return snapshot.exists();
      }),
      catchError(error => {
        console.error('Error checking player existence:', error);
        return of(false);
      })
    );
  }

  /**
   * Deletes a player document
   * @param uid Player UID to delete
   * @returns Observable with void when complete
   */
  deletePlayer(uid: string): Observable<void> {
    const playerDocRef = doc(this.firestore, `players/${uid}`);
    return from(deleteDoc(playerDocRef)).pipe(
      catchError((error: FirestoreError) => {
        console.error('Error deleting player:', error);
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
    const errorMessages: Record<string, string> = {
      'permission-denied': 'No tienes permiso para realizar esta operación',
      'unavailable': 'Error de conexión. Por favor verifica tu internet',
      'not-found': 'El documento no fue encontrado',
      'already-exists': 'El documento ya existe',
      'invalid-argument': 'Datos proporcionados no válidos',
      'failed-precondition': 'Operación no permitida en el estado actual',
      'aborted': 'Operación cancelada',
      'out-of-range': 'Operación fuera de límites permitidos',
      'unimplemented': 'Operación no implementada',
      'internal': 'Error interno del servidor',
      'data-loss': 'Pérdida de datos',
      'unauthenticated': 'Debes autenticarte para realizar esta acción'
    };

    return errorMessages[error.code] || 'Ocurrió un error desconocido';
  }
}
