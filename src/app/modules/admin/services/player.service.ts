import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  CollectionReference,
  DocumentData,
  FirestoreError,
  onSnapshot,
  QuerySnapshot
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

  getPlayers(): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      // Escucha los cambios en la colección utilizando onSnapshot.
      const unsubscribe = onSnapshot(
        this.playersCollection,
        (snapshot: QuerySnapshot) => {
          // Mapea los documentos a un array de datos.
          const players = snapshot.docs.map(doc => ({
            id: doc.id, // Incluye el ID del documento.
            ...doc.data() // Combina los datos del documento.
          }));

          observer.next(players); // Emite los datos actualizados.
        },
        (error) => {
          console.error('Error al escuchar cambios en tarifas:', error); // Registra el error.
          observer.error(error); // Notifica al observador sobre el error.
        }
      );

      // Retorna la función de limpieza para evitar fugas de memoria.
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
