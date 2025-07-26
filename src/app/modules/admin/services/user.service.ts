import { Injectable } from '@angular/core';
import { collection, Firestore, onSnapshot, query, where, doc, updateDoc, addDoc, deleteDoc, limit } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Player, PlayerDivision, PlayerRole, PlayerStatus } from '../models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private division1Players$ = new BehaviorSubject<Player[]>([]);
  private division2Players$ = new BehaviorSubject<Player[]>([]);
  private moderators$ = new BehaviorSubject<Player[]>([]);
  private subModerators$ = new BehaviorSubject<Player[]>([]);
  private allPlayers$ = new BehaviorSubject<Player[]>([]);
  private searchResults$ = new BehaviorSubject<Player[]>([]);

  constructor(private firestore: Firestore) {
    this.setupRealTimeListeners();
  }

  private setupRealTimeListeners(): void {
    const allPlayersQuery = query(
      collection(this.firestore, 'players'),
      where('status', '!=', PlayerStatus.Deleted)
    );
    
    onSnapshot(allPlayersQuery, (snapshot) => {
      const allPlayers = snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data(),
        // Aseguramos que idDota sea número
        idDota: Number(doc.data()['idDota']) || 0
      } as Player));
      
      this.allPlayers$.next(allPlayers);
      this.updateFilteredLists(allPlayers);
    });
  }

  private updateFilteredLists(allPlayers: Player[]): void {
    this.division1Players$.next(
      allPlayers.filter(p => p.playerDivision === PlayerDivision.Division1)
    );
    this.division2Players$.next(
      allPlayers.filter(p => p.playerDivision === PlayerDivision.Division2)
    );
    this.moderators$.next(
      allPlayers.filter(p => p.rolUser === PlayerRole.Admin)
    );
    this.subModerators$.next(
      allPlayers.filter(p => p.rolUser === PlayerRole.SubAdmin)
    );
  }

  // Obtener jugadores de división 1 (observable en tiempo real)
  getDivision1Players(): Observable<Player[]> {
    return this.division1Players$.asObservable();
  }

  // Obtener jugadores de división 2 (observable en tiempo real)
  getDivision2Players(): Observable<Player[]> {
    return this.division2Players$.asObservable();
  }

  // Obtener moderadores (observable en tiempo real)
  getModerators(): Observable<Player[]> {
    return this.moderators$.asObservable();
  }

  // Obtener submoderadores (observable en tiempo real)
  getSubModerators(): Observable<Player[]> {
    return this.subModerators$.asObservable();
  }

  getSearchResults(): Observable<Player[]> { 
    return this.searchResults$.asObservable(); 
  }

  // Actualizar división de un jugador
  async updatePlayerDivision(playerId: string, division: PlayerDivision): Promise<void> {
    const playerRef = doc(this.firestore, `players/${playerId}`);
    await updateDoc(playerRef, { playerDivision: division, tempVisibleDivision: division });
  }

  // Actualizar rol de un usuario
  async updateUserRole(userId: string, role: PlayerRole): Promise<void> {
    const userRef = doc(this.firestore, `players/${userId}`);
    await updateDoc(userRef, {
      rolUser: role
    });
  }

  // Actualizar estado de un jugador
  async updatePlayerStatus(playerId: string, status: PlayerStatus): Promise<void> {
    const playerRef = doc(this.firestore, `players/${playerId}`);
    await updateDoc(playerRef, {
      status: status
    });
  }

  async updatePlayer(playerId: string, playerData: Partial<Player>): Promise<void> {
  try {
    const playerRef = doc(this.firestore, 'players', playerId);
    await updateDoc(playerRef, playerData);
    console.log('Jugador actualizado correctamente en Firebase');
  } catch (error) {
    console.error('Error al actualizar jugador:', error);
    throw error;
  }
}

  // Crear un nuevo usuario (moderador/submoderador)
  async createUser(userData: Partial<Player>): Promise<void> {
    await addDoc(collection(this.firestore, 'players'), {
      ...userData,
      registrationDate: new Date(),
      status: PlayerStatus.Active
    });
  }

  // Eliminar un usuario (soft delete)
  async deleteUser(userId: string): Promise<void> {
    const userRef = doc(this.firestore, `players/${userId}`);
    await updateDoc(userRef, {
      status: PlayerStatus.Deleted
    });
  }

  // Buscar jugadores por nickname
  searchPlayersByNickname(nickname: string): Observable<Player[]> {
    return new Observable(subscriber => {
      const q = query(
        collection(this.firestore, 'players'),
        where('nick', '>=', nickname),
        where('nick', '<=', nickname + '\uf8ff'),
        where('status', '!=', PlayerStatus.Deleted),
        limit(10)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const players = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Player));
        subscriber.next(players);
      });
      
      return () => unsubscribe();
    });
  }

  // Buscar por nick o ID Dota
  searchPlayers(term: string): Observable<Player[]> {
    if (!term.trim()) {
      return of([]);
    }

    const termLower = term.toLowerCase();
    const allPlayers = this.allPlayers$.value;
    
    const results = allPlayers.filter(player => 
      player.nick.toLowerCase().includes(termLower) || 
      player.idDota?.toString().includes(term)
    );

    return of(results);
}
  
}
