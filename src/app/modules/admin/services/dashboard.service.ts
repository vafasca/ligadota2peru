import { Injectable } from '@angular/core';
import { collection, Firestore, getCountFromServer, onSnapshot, query, where } from '@angular/fire/firestore';
import { BehaviorSubject, combineLatest, from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private activeTournamentsSubject = new BehaviorSubject<number>(0);
  private division1PlayersSubject = new BehaviorSubject<{active: number, total: number}>({active: 0, total: 0});
  private division2PlayersSubject = new BehaviorSubject<{active: number, total: number}>({active: 0, total: 0});
  private moderatorsSubject = new BehaviorSubject<{active: number, total: number}>({active: 0, total: 0}); // Nuevo Subject para moderadores

  constructor(private firestore: Firestore) {
    this.setupRealTimeListeners();
  }

  private setupRealTimeListeners(): void {
    // Torneos activos
    const tournamentsQuery = query(
      collection(this.firestore, 'tournaments'),
      where('status', 'in', ['Programado', 'En progreso'])
    );
    
    onSnapshot(tournamentsQuery, (snapshot) => {
      this.activeTournamentsSubject.next(snapshot.size);
    });

    // Jugadores División 1
    const div1ActiveQuery = query(
      collection(this.firestore, 'players'),
      where('playerDivision', '==', 'division1'),
      where('status', '==', 'Activo')
    );
    
    const div1TotalQuery = query(
      collection(this.firestore, 'players'),
      where('playerDivision', '==', 'division1')
    );
    
    onSnapshot(div1ActiveQuery, (activeSnapshot) => {
      onSnapshot(div1TotalQuery, (totalSnapshot) => {
        this.division1PlayersSubject.next({
          active: activeSnapshot.size,
          total: totalSnapshot.size
        });
      });
    });

    // Jugadores División 2
    const div2ActiveQuery = query(
      collection(this.firestore, 'players'),
      where('playerDivision', '==', 'division2'),
      where('status', '==', 'Activo')
    );
    
    const div2TotalQuery = query(
      collection(this.firestore, 'players'),
      where('playerDivision', '==', 'division2')
    );
    
    onSnapshot(div2ActiveQuery, (activeSnapshot) => {
      onSnapshot(div2TotalQuery, (totalSnapshot) => {
        this.division2PlayersSubject.next({
          active: activeSnapshot.size,
          total: totalSnapshot.size
        });
      });
    });

    // Moderadores (admin + subadmin)
    const moderatorsActiveQuery = query(
      collection(this.firestore, 'players'),
      where('rolUser', 'in', ['admin', 'subadmin']),
      where('status', '==', 'Activo')
    );
    
    const moderatorsTotalQuery = query(
      collection(this.firestore, 'players'),
      where('rolUser', 'in', ['admin', 'subadmin'])
    );
    
    onSnapshot(moderatorsActiveQuery, (activeSnapshot) => {
      onSnapshot(moderatorsTotalQuery, (totalSnapshot) => {
        this.moderatorsSubject.next({
          active: activeSnapshot.size,
          total: totalSnapshot.size
        });
      });
    });
  }

  getDashboardStats(): Observable<{
    activeTournaments: number;
    division1Players: {active: number, total: number};
    division2Players: {active: number, total: number};
    moderators: {active: number, total: number}; // Nuevo campo para moderadores
  }> {
    return combineLatest([
      this.activeTournamentsSubject.asObservable(),
      this.division1PlayersSubject.asObservable(),
      this.division2PlayersSubject.asObservable(),
      this.moderatorsSubject.asObservable() // Agregamos el subject de moderadores
    ]).pipe(
      map(([activeTournaments, division1Players, division2Players, moderators]) => ({
        activeTournaments,
        division1Players,
        division2Players,
        moderators // Incluimos moderadores en la respuesta
      }))
    );
  }
}
