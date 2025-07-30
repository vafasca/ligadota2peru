import { Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, deleteDoc, doc, DocumentData, Firestore, FirestoreError, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { Tournament, TournamentStatus } from '../models/tournament.model';
import { Team } from '../models/equipos.model';

@Injectable({
  providedIn: 'root'
})
export class PanelAdminService {
private tournamentsCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.tournamentsCollection = collection(this.firestore, 'tournaments');
  }

  /**
   * Creates a new tournament
   * @param tournament Tournament data to be created
   * @returns Observable with the tournament ID when created
   */
  createTournament(tournament: Tournament): Observable<string> {
  const tournamentWithServerTimestamps = {
    ...tournament,
    createdAt: serverTimestamp(), // Fecha/hora del servidor
    updatedAt: serverTimestamp()
  };
  
  return from(addDoc(this.tournamentsCollection, tournamentWithServerTimestamps)).pipe(
    map(docRef => docRef.id)
  );
}

  /**
   * Updates tournament data
   * @param tournamentId Tournament ID
   * @param data Partial tournament data to update
   * @returns Observable with void when complete
   */
  updateTournament(tournamentId: string, data: Partial<Tournament>): Observable<void> {
    const tournamentDocRef = doc(this.firestore, `tournaments/${tournamentId}`);
    return from(updateDoc(tournamentDocRef, data)).pipe(
      catchError((error: FirestoreError) => {
        console.error('Error updating tournament:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  /**
   * Gets a tournament by ID
   * @param tournamentId Tournament ID
   * @returns Observable with Tournament or null if not found
   */
  getTournament(tournamentId: string): Observable<Tournament | null> {
  const tournamentDocRef = doc(this.firestore, `tournaments/${tournamentId}`);
  return from(getDoc(tournamentDocRef)).pipe(
    map(snapshot => {
      if (!snapshot.exists()) return null;
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        startDate: data['startDate']?.toDate() || null,
        endDate: data['endDate']?.toDate() || null,
        registrationStartDate: data['registrationStartDate']?.toDate() || null,
        registrationEndDate: data['registrationEndDate']?.toDate() || null,
        createdAt: data['createdAt']?.toDate() || null,
        updatedAt: data['updatedAt']?.toDate() || null
      } as Tournament;
    }),
    catchError((error: FirestoreError) => {
      console.error('Error getting tournament:', error);
      return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
    })
  );
}

  /**
   * Gets all tournaments with real-time updates
   * @returns Observable with array of Tournaments
   */
  // En tu servicio (tournament.service.ts)
// En tu servicio al obtener torneos


// Usa este método al mapear los datos:
getTournaments(): Observable<Tournament[]> {
  return new Observable<Tournament[]>(observer => {
    const q = query(this.tournamentsCollection, orderBy('startDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tournaments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // ✅ Convierte TODAS las fechas
          startDate: data['startDate']?.toDate() || null,
          endDate: data['endDate']?.toDate() || null,
          registrationStartDate: data['registrationStartDate']?.toDate() || null,
          registrationEndDate: data['registrationEndDate']?.toDate() || null,
          createdAt: data['createdAt']?.toDate() || null,
          updatedAt: data['updatedAt']?.toDate() || null
        } as Tournament;
      });
      observer.next(tournaments);
    });
    return () => unsubscribe();
  });
}

// Método para convertir a hora local (Cochabamba UTC-4)
private convertToLocalTime(utcDate: Date | null): Date | null {
  if (!utcDate) return null;
  
  // Cochabamba es UTC-4 (no usa horario de verano)
  const offset = -4 * 60 * 60 * 1000; // UTC-4 en milisegundos
  return new Date(utcDate.getTime() + offset);
}

  /**
   * Gets tournaments by status
   * @param status Tournament status to filter by
   * @returns Observable with array of Tournaments
   */
  getTournamentsByStatus(status: TournamentStatus): Observable<Tournament[]> {
    const q = query(
      this.tournamentsCollection, 
      where('status', '==', status),
      orderBy('startDate', 'desc')
    );
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Tournament))),
      catchError((error: FirestoreError) => {
        console.error('Error getting tournaments by status:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  /**
   * Gets active tournaments (status: 'En progreso')
   * @returns Observable with array of Tournaments
   */
  getActiveTournaments(): Observable<Tournament[]> {
    return this.getTournamentsByStatus('En progreso');
  }

  /**
   * Gets scheduled tournaments (status: 'Programado')
   * @returns Observable with array of Tournaments
   */
  getScheduledTournaments(): Observable<Tournament[]> {
    return this.getTournamentsByStatus('Programado');
  }

  /**
   * Gets finished tournaments (status: 'Finalizado')
   * @returns Observable with array of Tournaments
   */
  getFinishedTournaments(): Observable<Tournament[]> {
    return this.getTournamentsByStatus('Finalizado');
  }

  /**
   * Deletes a tournament
   * @param tournamentId Tournament ID to delete
   * @returns Observable with void when complete
   */
  deleteTournament(tournamentId: string): Observable<void> {
    const tournamentDocRef = doc(this.firestore, `tournaments/${tournamentId}`);
    return from(deleteDoc(tournamentDocRef)).pipe(
      catchError((error: FirestoreError) => {
        console.error('Error deleting tournament:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  /**
   * Adds a match to a tournament
   * @param tournamentId Tournament ID
   * @param match Match data to add
   * @returns Observable with void when complete
   */
  addTournamentMatch(tournamentId: string, match: any): Observable<void> {
    const matchDocRef = doc(this.firestore, `tournaments/${tournamentId}/matches/${match.id}`);
    return from(setDoc(matchDocRef, match)).pipe(
      catchError((error: FirestoreError) => {
        console.error('Error adding match to tournament:', error);
        return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
      })
    );
  }

  /**
   * Gets all matches for a tournament with real-time updates
   * @param tournamentId Tournament ID
   * @returns Observable with array of Matches
   */
  getTournamentMatches(tournamentId: string): Observable<any[]> {
    const matchesCollection = collection(this.firestore, `tournaments/${tournamentId}/matches`);
    return new Observable<any[]>(observer => {
      const unsubscribe = onSnapshot(
        matchesCollection,
        (snapshot) => {
          const matches = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          observer.next(matches);
        },
        (error) => {
          console.error('Error listening to tournament matches:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * Gets pending matches for a tournament
   * @param tournamentId Tournament ID
   * @returns Observable with array of pending Matches
   */
  getPendingMatches(tournamentId: string): Observable<any[]> {
    const matchesCollection = collection(this.firestore, `tournaments/${tournamentId}/matches`);
    const q = query(matchesCollection, where('status', '==', 'pending'));
    
    return new Observable<any[]>(observer => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const matches = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          observer.next(matches);
        },
        (error) => {
          console.error('Error listening to pending matches:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  getTournamentTeams(tournamentId: string): Observable<Team[]> {
  return new Observable<Team[]>(observer => {
    // Primero obtenemos el torneo para sacar los IDs de los equipos
    this.getTournament(tournamentId).subscribe({
      next: (tournament) => {
        if (!tournament || !tournament.teams || tournament.teams.length === 0) {
          observer.next([]);
          return;
        }

        // Obtenemos los detalles de cada equipo
        const teamsCollection = collection(this.firestore, 'teams');
        const teamPromises = tournament.teams.map(teamId => 
          getDoc(doc(teamsCollection, teamId)).then(doc => {
            if (doc.exists()) {
              return { id: doc.id, ...doc.data() } as Team;
            }
            return null;
          })
        );

        Promise.all(teamPromises).then(teams => {
          observer.next(teams.filter(team => team !== null) as Team[]);
        });
      },
      error: (err) => {
        console.error('Error loading tournament teams:', err);
        observer.next([]);
      }
    });
  });
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
      'not-found': 'El torneo no fue encontrado',
      'already-exists': 'El torneo ya existe',
      'invalid-argument': 'Datos del torneo no válidos',
      'failed-precondition': 'Operación no permitida en el estado actual del torneo',
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
