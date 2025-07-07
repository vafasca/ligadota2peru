import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, writeBatch, getDoc } from '@angular/fire/firestore';
import { Observable, forkJoin, from, map, switchMap } from 'rxjs';
import { Challenge } from '../../admin/models/challenge.model';
import { TeamService } from '../../main-menu/services/team.service';
import { TeamAvailability } from '../../admin/models/equipos.model';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
private challengesCollection = collection(this.firestore, 'challenges');

  constructor(
    private firestore: Firestore,
    private teamService: TeamService
  ) {}

  checkExistingChallenge(fromTeamId: string, toTeamId: string): Observable<boolean> {
    const q = query(
      this.challengesCollection,
      where('fromTeamId', '==', fromTeamId),
      where('toTeamId', '==', toTeamId),
      where('status', '==', 'pending')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => !snapshot.empty)
    );
  }

  createChallenge(challenge: Omit<Challenge, 'id'>): Observable<string> {
  return this.checkReciprocalChallenge(challenge.fromTeamId, challenge.toTeamId).pipe(
    switchMap(hasReciprocalChallenge => {
      if (hasReciprocalChallenge) {
        throw new Error('Ya existe un desafío pendiente del equipo contrario');
      }
      return from(addDoc(this.challengesCollection, challenge)).pipe(
        map(ref => ref.id)
      );
    })
  );
}

  updateChallenge(challengeId: string, data: Partial<Challenge>): Observable<void> {
    const challengeDocRef = doc(this.firestore, `challenges/${challengeId}`);
    return from(updateDoc(challengeDocRef, data));
  }

  deleteChallenge(challengeId: string): Observable<void> {
    const challengeDocRef = doc(this.firestore, `challenges/${challengeId}`);
    return from(deleteDoc(challengeDocRef));
  }

  getChallengesForTeam(teamId: string): Observable<Challenge[]> {
    const q = query(
      this.challengesCollection,
      where('toTeamId', '==', teamId),
      where('status', '==', 'pending')
    );

    return new Observable<Challenge[]>(observer => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const challenges = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Challenge));
        observer.next(challenges);
      });
      return () => unsubscribe();
    });
  }

  acceptChallenge(challengeId: string): Observable<void> {
  const challengeDocRef = doc(this.firestore, `challenges/${challengeId}`);
  return from(getDoc(challengeDocRef)).pipe(
    switchMap(challengeSnapshot => {
      if (!challengeSnapshot.exists()) {
        throw new Error('Desafío no encontrado');
      }
      const challenge = challengeSnapshot.data() as Challenge;
      // Verificar el estado de ambos equipos
      return forkJoin([
        this.teamService.getTeam(challenge.fromTeamId),
        this.teamService.getTeam(challenge.toTeamId)
      ]).pipe(
        switchMap(([fromTeam, toTeam]) => {
          if (!fromTeam || !toTeam) {
            throw new Error('Uno de los equipos no existe');
          }
          if (fromTeam.status !== 'active' || toTeam.status !== 'active') {
            throw new Error('Uno de los equipos no está disponible');
          }
          // Proceder con la aceptación
          return from(updateDoc(challengeDocRef, { status: 'accepted' })).pipe(
            switchMap(() => {
              const updateFromTeam = this.teamService.updateTeam(challenge.fromTeamId, {
                status: TeamAvailability.InGame
              });
              const updateToTeam = this.teamService.updateTeam(challenge.toTeamId, {
                status: TeamAvailability.InGame
              });
              return Promise.all([updateFromTeam, updateToTeam]).then(() => {});
            })
          );
        })
      );
    })
  );
}

  rejectChallenge(challengeId: string): Observable<void> {
    const challengeDocRef = doc(this.firestore, `challenges/${challengeId}`);
    return from(updateDoc(challengeDocRef, { status: 'rejected' }));
  }

  // Cuando un equipo acepta un desafío, cancelar todos los demás
  async cancelOtherChallenges(toTeamId: string, currentChallengeId: string) {
  const challengesRef = collection(this.firestore, 'challenges');
  const querySnapshot = await getDocs(
    query(
      challengesRef,
      where('toTeamId', '==', toTeamId),
      where('status', '==', 'pending')
    )
  );

  const batch = writeBatch(this.firestore);
  querySnapshot.forEach(doc => {
    if(doc.id !== currentChallengeId) {
      batch.update(doc.ref, { status: 'cancelled' });
    }
  });
  
  await batch.commit();
}

checkReciprocalChallenge(fromTeamId: string, toTeamId: string): Observable<boolean> {
  const q = query(
    this.challengesCollection,
    where('fromTeamId', '==', toTeamId),
    where('toTeamId', '==', fromTeamId),
    where('status', '==', 'pending')
  );

  return from(getDocs(q)).pipe(
    map(snapshot => !snapshot.empty)
  );
}
}
