import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Team, TeamPlayer } from '../../admin/models/equipos.model';
import { Player, PlayerDivision } from '../../admin/models/jugador.model';
import { PlayerService } from '../../admin/services/player.service';
// import { Team, TeamPlayer } from '../models/equipos.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teamsCollection;

  constructor(private firestore: Firestore, private playerService: PlayerService) {
     this.teamsCollection = collection(this.firestore, 'teams');
  }

  createTeam(team: Omit<Team, 'id'>): Observable<string> {
  // Asegúrate de que el equipo tenga la división del capitán
  return this.playerService.getPlayer(team.captainId).pipe(
    switchMap(captain => {
      if (!captain) {
        return throwError(() => new Error('Capitán no encontrado'));
      }
      
      const teamWithDivision = {
        ...team,
        division: captain.tempVisibleDivision || captain.playerDivision
      };
      
      return from(addDoc(this.teamsCollection, teamWithDivision)).pipe(
        map(ref => ref.id),
        catchError(this.handleError)
      );
    }),
    catchError(this.handleError)
  );
}

getTeamsByDivision(division: PlayerDivision): Observable<Team[]> {
  return this.getTeams().pipe(
    map(teams => teams.filter(team => team.division === division))
  );
}


  getTeam(teamId: string): Observable<Team | null> {
    const teamDocRef = doc(this.firestore, `teams/${teamId}`);
    return from(getDoc(teamDocRef)).pipe(
      map(snapshot => snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Team : null),
      catchError(this.handleError)
    );
  }

  getTeams(): Observable<Team[]> {
    return new Observable<Team[]>(observer => {
      const unsubscribe = onSnapshot(
        this.teamsCollection,
        (snapshot) => {
          const teams = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Team));
          observer.next(teams);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  // team.service.ts
getUserTeam(userId: string): Observable<Team | null> {
  return this.getTeams().pipe(
    map(teams => {
      const team = teams.find(team => 
        team.captainId === userId || team.players.some(p => p.uid === userId)
      );
      return team || null; // Convertimos undefined a null
    })
  );
}

  updateTeam(teamId: string, data: Partial<Team>): Observable<void> {
    const teamDocRef = doc(this.firestore, `teams/${teamId}`);
    return from(updateDoc(teamDocRef, data)).pipe(
      catchError(this.handleError)
    );
  }

  deleteTeam(teamId: string): Observable<void> {
    const teamDocRef = doc(this.firestore, `teams/${teamId}`);
    return from(deleteDoc(teamDocRef)).pipe(
      catchError(this.handleError)
    );
  }

  addPlayerToTeam(teamId: string, player: TeamPlayer): Observable<void> {
    const teamDocRef = doc(this.firestore, `teams/${teamId}`);
    return from(updateDoc(teamDocRef, {
      players: arrayUnion(player)
    })).pipe(
      catchError(this.handleError)
    );
  }

  removePlayerFromTeam(teamId: string, player: TeamPlayer): Observable<void> {
    const teamDocRef = doc(this.firestore, `teams/${teamId}`);
    return from(updateDoc(teamDocRef, {
      players: arrayRemove(player)
    })).pipe(
      catchError(this.handleError)
    );
  }

  updatePlayerRole(teamId: string, playerId: string, newRole: string): Observable<void> {
    return this.getTeam(teamId).pipe(
      switchMap(team => {
        if (!team) return throwError(() => new Error('Team not found'));
        
        const updatedPlayers = team.players.map(p => 
          p.uid === playerId ? { ...p, role: newRole } : p
        );
        
        return this.updateTeam(teamId, { players: updatedPlayers });
      }),
      catchError(this.handleError)
    );
  }

  /**
 * Obtiene y escucha en tiempo real los jugadores de un equipo
 * @param teamId ID del equipo
 * @returns Observable<Player[]>
 */
 getTeamPlayersRealTime(teamId: string): Observable<Player[]> {
  const teamDocRef = doc(this.firestore, `teams/${teamId}`);
  return new Observable<Player[]>(observer => {
    const unsubscribe = onSnapshot(
      teamDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          observer.next([]);
          return;
        }
        const teamData = snapshot.data() as Team;
        const playersInTeam = teamData.players || [];

        // Obtener los datos completos de cada jugador desde la colección players
        const playerPromises = playersInTeam.map(p => 
          getDoc(doc(this.firestore, `players/${p.uid}`))
        );

        Promise.all(playerPromises).then(playerDocs => {
          const players: Player[] = playerDocs.map((doc, index) => {
            const playerData = doc.exists() ? doc.data() as Player : null;
            return {
              uid: playersInTeam[index].uid,
              avatar: playersInTeam[index].avatar,
              mmr: playersInTeam[index].mmr,
              medalImage: playersInTeam[index].medalImage,
              nick: playersInTeam[index].nick,
              role: playersInTeam[index].role,
              idDota: playerData?.idDota || 0, // Usar 0 como valor por defecto
              category: playerData?.category || '',
              medal: playerData?.medal || '',
              status: playerData?.status || 'Activo',
              rating: playerData?.rating || 0,
              secondaryRole: playerData?.secondaryRole || '',
              secondaryCategory: playerData?.secondaryCategory || '',
              availability: 'in_team',
              // ... otros campos necesarios
            } as Player;
          });
          observer.next(players);
        });
      },
      (error) => {
        observer.error(error);
      }
    );
    return () => unsubscribe();
  });
}

finishGame(teamId: string): Observable<void> {
  const teamDocRef = doc(this.firestore, `teams/${teamId}`);
  return from(updateDoc(teamDocRef, { status: 'active' }));
}

  private handleError(error: any): Observable<never> {
    console.error('Error in TeamService:', error);
    return throwError(() => new Error('An error occurred'));
  }
}
