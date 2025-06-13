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
  updateDoc,
  arrayUnion,
  arrayRemove
} from '@angular/fire/firestore';
import { Player, PlayerDivision } from '../models/jugador.model';
import { catchError, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { Match } from '../models/match.model';
import { Team } from '../models/equipos.model';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private playersCollection: CollectionReference<DocumentData>;
  private teamsCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.playersCollection = collection(this.firestore, 'players');
    this.teamsCollection = collection(this.firestore, 'teams');
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
  // En tu PlayerService
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
        // console.log('Player snapshot:', snapshot.exists());
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

  // player.service.ts

getAvailablePlayersByDivision(division: PlayerDivision): Observable<Player[]> {
  const q = query(
    this.playersCollection,
    where('status', '==', 'Activo'),
    where('availability', '==', 'available')
  );

  return new Observable<Player[]>(observer => {
    const unsubscribe = onSnapshot(q, snapshot => {
      const players = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as Player)).filter(player => {
        // Mostrar solo si:
        // - Su división temporal es esta, o
        // - Su división original es esta Y no tiene visibilidad temporal
        return (
          player.tempVisibleDivision === division ||
          (player.playerDivision === division && !player.tempVisibleDivision)
        );
      });
      observer.next(players);
    }, error => {
      console.error('Error escuchando jugadores disponibles:', error);
      observer.error(error);
    });
    return () => unsubscribe();
  });
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
    // console.log('Checking player exists for UID:', uid);
    const playerDocRef = doc(this.firestore, `players/${uid}`);
    return from(getDoc(playerDocRef)).pipe(
      map(snapshot => {
        // console.log('Player exists check result:', snapshot.exists());
        return snapshot.exists();
      }),
      catchError(error => {
        // console.error('Error checking player existence:', error);
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
   * Crea un nuevo equipo
   * @param team Datos del equipo
   * @returns Observable con el ID del equipo creado
   */
  // createTeam(team: Omit<Team, 'id'>): Observable<string> {
  //   return from(addDoc(this.teamsCollection, team)).pipe(
  //     map(ref => ref.id),
  //     catchError((error: FirestoreError) => {
  //       console.error('Error creating team:', error);
  //       return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
  //     })
  //   );
  // }

  /**
   * Actualiza un equipo
   * @param teamId ID del equipo
   * @param data Datos a actualizar
   * @returns Observable vacío
   */
  // updateTeam(teamId: string, data: Partial<Team>): Observable<void> {
  //   const teamDocRef = doc(this.firestore, `teams/${teamId}`);
  //   return from(updateDoc(teamDocRef, data)).pipe(
  //     catchError((error: FirestoreError) => {
  //       console.error('Error updating team:', error);
  //       return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
  //     })
  //   );
  // }

  /**
   * Obtiene un equipo por ID
   * @param teamId ID del equipo
   * @returns Observable con el equipo o null si no existe
   */
  // getTeam(teamId: string): Observable<Team | null> {
  //   const teamDocRef = doc(this.firestore, `teams/${teamId}`);
  //   return from(getDoc(teamDocRef)).pipe(
  //     map(snapshot => snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Team : null),
  //     catchError((error: FirestoreError) => {
  //       console.error('Error getting team:', error);
  //       return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
  //     })
  //   );
  // }

  /**
   * Obtiene todos los equipos con actualizaciones en tiempo real
   * @returns Observable con array de equipos
   */
  // getTeams(): Observable<Team[]> {
  //   return new Observable<Team[]>(observer => {
  //     const unsubscribe = onSnapshot(
  //       this.teamsCollection,
  //       (snapshot) => {
  //         const teams = snapshot.docs.map(doc => ({
  //           id: doc.id,
  //           ...doc.data()
  //         } as Team));
  //         observer.next(teams);
  //       },
  //       (error) => {
  //         console.error('Error listening to teams:', error);
  //         observer.error(error);
  //       }
  //     );

  //     return () => unsubscribe();
  //   });
  // }

/**
 * Añade un jugador a un equipo con su rol, avatar, mmr y nick
 * @param teamId ID del equipo
 * @param playerId ID del jugador
 * @param role Rol del jugador
 * @param avatar Avatar del jugador
 * @param mmr MMR del jugador
 * @param nick Nick del jugador
 * @returns Observable vacío
 */
addPlayerToTeam(
  teamId: string,
  playerId: string,
  role: string,
  avatar: string,
  mmr: number,
  nick: string,
  medalImage: string
): Observable<void> {
  const playerDocRef = doc(this.firestore, `players/${playerId}`);
  return from(updateDoc(playerDocRef, { 
    teamId,
    availability: 'in_team'
  })).pipe(
    switchMap(() => {
      const teamDocRef = doc(this.firestore, `teams/${teamId}`);
      const playerData = {
        uid: playerId,
        role,
        avatar,
        mmr,
        nick,
        medalImage
      };
      return from(updateDoc(teamDocRef, {
        players: arrayUnion(playerData)
      }));
    }),
    catchError((error: FirestoreError) => {
      console.error('Error adding player to team:', error);
      return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
    })
  );
}

/**
 * Elimina un jugador de un equipo
 * @param teamId ID del equipo
 * @param playerId ID del jugador
 * @param role Rol del jugador
 * @param avatar Avatar del jugador
 * @param mmr MMR del jugador
 * @param nick Nick del jugador
 * @param medalImage Imagen de medalla del jugador
 * @returns Observable vacío
 */
removePlayerFromTeam(
  teamId: string, 
  playerId: string,
  role: string,
  avatar: string,
  mmr: number,
  nick: string,
  medalImage: string
): Observable<void> {
  const playerDocRef = doc(this.firestore, `players/${playerId}`);
  return from(updateDoc(playerDocRef, { 
    teamId: null,
    availability: 'available'
  })).pipe(
    switchMap(() => {
      const teamDocRef = doc(this.firestore, `teams/${teamId}`);
      const playerData = {
        uid: playerId,
        role,
        avatar,
        mmr,
        nick,
        medalImage
      };
      return from(updateDoc(teamDocRef, {
        players: arrayRemove(playerData)
      }));
    }),
    catchError((error: FirestoreError) => {
      console.error('Error removing player from team:', error);
      return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
    })
  );
}

/**
 * Obtiene todos los jugadores activos (status: 'Activo')
 * @returns Observable<Player[]>
 */
getActivePlayers(): Observable<Player[]> {
  const q = query(
    this.playersCollection,
    where('status', '==', 'Activo')
  );

  return new Observable<Player[]>(observer => {
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const players = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as Player));
        observer.next(players);
      },
      (error) => {
        console.error('Error escuchando jugadores activos:', error);
        observer.error(error);
      }
    );
    return () => unsubscribe();
  });
}

/**
 * Obtiene los jugadores disponibles (status: 'Activo' y availability: 'available')
 * @returns Observable<Player[]>
 */
getAvailablePlayers(): Observable<Player[]> {
  const q = query(
    this.playersCollection,
    where('status', '==', 'Activo'),
    where('availability', '==', 'available')
  );

  return new Observable<Player[]>(observer => {
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const players = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as Player));
        observer.next(players);
      },
      (error) => {
        console.error('Error escuchando jugadores disponibles:', error);
        observer.error(error);
      }
    );
    return () => unsubscribe();
  });
}

/**
 * Actualiza el rol de un jugador en un equipo
 * @param teamId ID del equipo
 * @param playerId ID del jugador
 * @param newRole Nuevo rol
 */
// updatePlayerRole(teamId: string, playerId: string, newRole: string): Observable<void> {
//   const teamDocRef = doc(this.firestore, `teams/${teamId}`);
  
//   return from(getDoc(teamDocRef)).pipe(
//     switchMap(teamSnapshot => {
//       if (!teamSnapshot.exists()) {
//         return throwError(() => new Error('Equipo no encontrado'));
//       }
      
//       const teamData = teamSnapshot.data() as Team;
//       const players = teamData.players || [];
      
//       // Actualiza el rol del jugador
//       const updatedPlayers = players.map(p => 
//         p.uid === playerId ? { ...p, role: newRole } : p
//       );
      
//       return from(updateDoc(teamDocRef, { players: updatedPlayers }));
//     }),
//     catchError((error: FirestoreError) => {
//       console.error('Error actualizando rol:', error);
//       return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
//     })
//   );
// }


  /**
   * Obtiene los jugadores de un equipo específico
   * @param teamId ID del equipo
   * @returns Observable con array de jugadores
   */
  /**
 * Obtiene los jugadores de un equipo específico
 * @param teamId ID del equipo
 * @returns Observable<Player[]>
 */
getTeamPlayers(teamId: string): Observable<Player[]> {
  const teamDocRef = doc(this.firestore, `teams/${teamId}`);
  return from(getDoc(teamDocRef)).pipe(
    switchMap(teamSnapshot => {
      if (!teamSnapshot.exists()) {
        return throwError(() => new Error('Equipo no encontrado'));
      }

      const teamData = { id: teamSnapshot.id, ...teamSnapshot.data() } as Team;

      if (!teamData.players || teamData.players.length === 0) {
        return of([]);
      }

      // Extraemos solo los UIDs para obtener los documentos de Firestore
      const playerUids = teamData.players.map(p => p.uid);

      const playerPromises = playerUids.map(uid =>
        getDoc(doc(this.firestore, `players/${uid}`))
      );

      return from(Promise.all(playerPromises)).pipe(
        map(snapshots =>
          snapshots
            .filter(snapshot => snapshot.exists())
            .map(snapshot => ({
              uid: snapshot.id,
              ...snapshot.data()
            } as Player))
        )
      );
    }),
    catchError((error: FirestoreError) => {
      console.error('Error obteniendo jugadores del equipo:', error);
      return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
    })
  );
}

// deleteTeam(teamId: string): Observable<void> {
//   const teamDocRef = doc(this.firestore, `teams/${teamId}`);
//   return from(deleteDoc(teamDocRef)).pipe(
//     catchError((error: FirestoreError) => {
//       console.error('Error deleting team:', error);
//       return throwError(() => new Error(this.getFirestoreErrorMessage(error)));
//     })
//   );
// }

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
