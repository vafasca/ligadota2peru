import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, onSnapshot, query, where } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { Notification } from '../modules/admin/models/notification.model'; // Adjust the import path as necessary

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
private notificationsCollection = collection(this.firestore, 'notifications');

  constructor(private firestore: Firestore) {}

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

  createNotification(notification: Omit<Notification, 'id'>): Observable<string> {
  return from(addDoc(this.notificationsCollection, notification)).pipe(
    map(docRef => docRef.id)
  );
}
}
