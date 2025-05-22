import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AccessCodeService {

  constructor(private firestore: Firestore) { }

  async validateAndDeleteCode(code: string): Promise<boolean> {
    try {
      const codeRef = doc(this.firestore, `accessCodes/${code}`);
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
        // Eliminar el código después de validarlo
        // await deleteDoc(codeRef);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error validating code:', error);
      return false;
    }
  }
}
