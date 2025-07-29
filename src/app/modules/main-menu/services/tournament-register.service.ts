import { Injectable } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, Firestore, increment, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { Tournament } from '../../admin/models/tournament.model';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { TournamentTeam } from '../../tournament/models/team.model';
import { Team } from '../../admin/models/equipos.model';
import { PlayerDivision } from '../../admin/models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentRegisterService {
private tournamentsCollection;
private tournamentTeamsCollection;

  constructor(private firestore: Firestore) {
    this.tournamentsCollection = collection(this.firestore, 'tournaments');
    this.tournamentTeamsCollection = collection(this.firestore, 'tournament_teams');
  }

  getActiveTournaments(): Observable<Tournament[]> {
    const q = query(
      this.tournamentsCollection,
      where('status', 'in', ['Programado', 'En progreso'])
    );

    return new Observable<Tournament[]>(observer => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tournaments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Tournament));
        observer.next(tournaments);
      }, error => observer.error(error));
      
      return () => unsubscribe();
    });
  }

  registerTeamToTournament(tournamentId: string, team: Team): Observable<string> {
    // Validar que todos los campos requeridos estén presentes
    if (!team.id || !team.name || !team.captainId || !team.players || !team.division) {
      return throwError(() => new Error('Datos del equipo incompletos'));
    }

    const tournamentTeamData: Omit<TournamentTeam, 'id'> = {
      tournamentId,
      originalTeamId: team.id,
      name: team.name,
      captainId: team.captainId,
      players: team.players.map(p => ({
        uid: p.uid,
        nick: p.nick || 'Sin nombre',
        role: p.role || 'Sin rol',
        avatar: p.avatar || 'assets/default-avatar.png',
        mmr: p.mmr || 0,
        medalImage: p.medalImage || 'assets/default-medal.png',
        idDota: p.idDota || 0
      })),
      division: team.division,
      createdAt: new Date(),
      isActive: true,
      stats: {
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0
      }
    };

    // Verificar que no haya valores undefined
    this.validateTournamentTeamData(tournamentTeamData);

    // Primero creamos el equipo en tournament_teams
    return from(addDoc(this.tournamentTeamsCollection, tournamentTeamData)).pipe(
      // Luego actualizamos el torneo para añadir el equipo
      switchMap(docRef => {
        const tournamentDocRef = doc(this.firestore, `tournaments/${tournamentId}`);
        return from(updateDoc(tournamentDocRef, {
          teams: arrayUnion(team.id),
          currentTeams: increment(1)
        })).pipe(
          map(() => docRef.id) // Devolvemos el ID del equipo en tournament_teams
        );
      }),
      catchError(error => {
        console.error('Error registering team:', error);
        return throwError(() => new Error('Error al inscribir equipo'));
      })
    );
  }

  private validateTournamentTeamData(data: Omit<TournamentTeam, 'id'>): void {
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) {
        throw new Error(`Campo requerido '${key}' no puede ser undefined`);
      }
    });
    
    // Validación adicional para el array de jugadores
    if (!data.players || data.players.length === 0) {
      throw new Error('El equipo debe tener jugadores');
    }
  }

  getTournamentTeams(tournamentId: string): Observable<TournamentTeam[]> {
  const q = query(
    this.tournamentTeamsCollection,
    where('tournamentId', '==', tournamentId),
    where('isActive', '==', true)
  );

  return new Observable<TournamentTeam[]>(observer => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TournamentTeam));
      observer.next(teams);
    }, error => observer.error(error));
    
    return () => unsubscribe();
  });
}
}
