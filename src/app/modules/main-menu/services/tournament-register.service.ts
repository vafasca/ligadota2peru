import { Injectable } from '@angular/core';
import { arrayUnion, collection, doc, Firestore, increment, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { Tournament } from '../../admin/models/tournament.model';
import { catchError, from, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TournamentRegisterService {
private tournamentsCollection;

  constructor(private firestore: Firestore) {
    this.tournamentsCollection = collection(this.firestore, 'tournaments');
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

  registerTeamToTournament(tournamentId: string, teamId: string): Observable<void> {
    const tournamentDocRef = doc(this.firestore, `tournaments/${tournamentId}`);
    return from(updateDoc(tournamentDocRef, {
      teams: arrayUnion(teamId),
      currentTeams: increment(1)
    })).pipe(
      catchError(error => {
        console.error('Error registering team:', error);
        return throwError(() => new Error('Error al inscribir equipo'));
      })
    );
  }
}
