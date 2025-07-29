import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, onSnapshot, query, where, getDocs } from '@angular/fire/firestore';
import { from, map, Observable, switchMap } from 'rxjs';
import { Notification } from '../modules/admin/models/notification.model'; // Adjust the import path as necessary
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
private notificationsCollection = collection(this.firestore, 'notifications');

  constructor(
    private firestore: Firestore,
    private snackBar: MatSnackBar
  ) {}

  getNotifications(userId: string): Observable<Notification[]> {
    const q = query(
      this.notificationsCollection,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    return new Observable<Notification[]>(observer => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification));
        observer.next(notifications);
      });
      return () => unsubscribe();
    });
  }

  markAsRead(notificationId: string): Observable<void> {
    const notificationDocRef = doc(this.firestore, `notifications/${notificationId}`);
    return from(updateDoc(notificationDocRef, { read: true }));
  }

  createNotification(notification: Omit<Notification, 'id'> & { description?: string }): Observable<string> {
    return from(addDoc(this.notificationsCollection, notification)).pipe(
      map(docRef => docRef.id)
    );
}

markAllAsReadForChallenge(teamId: string): Observable<void> {
  const q = query(
    this.notificationsCollection,
    where('userId', '==', teamId),
    where('type', '==', 'challenge'),
    where('read', '==', false)
  );

  return from(getDocs(q)).pipe(
    switchMap(snapshot => {
      const batchPromises = snapshot.docs.map(doc => {
        return updateDoc(doc.ref, { read: true });
      });
      return Promise.all(batchPromises);
    }),
    map(() => undefined)
  );
}

//errores

showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
