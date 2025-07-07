import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, writeBatch } from '@angular/fire/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { Challenge } from '../../admin/models/challenge.model';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
private challengesCollection = collection(this.firestore, 'challenges');

  constructor(private firestore: Firestore) {}

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
    return from(addDoc(this.challengesCollection, challenge)).pipe(
      map(ref => ref.id)
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
    return from(updateDoc(challengeDocRef, { status: 'accepted' }));
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
}
