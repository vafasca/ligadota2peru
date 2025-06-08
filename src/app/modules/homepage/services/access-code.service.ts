import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { PlayerDivision } from '../../admin/models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class AccessCodeService {

  private readonly codeCollections = [
    { name: 'accessCodeDiv1', division: PlayerDivision.Division1 },
    { name: 'accessCodeDiv2', division: PlayerDivision.Division2 }
  ];

  constructor(private firestore: Firestore) { }

  async validateAndDeleteCode(code: string): Promise<{ found: boolean; division?: PlayerDivision; collection?: string }> {
    try {
      for (const collection of this.codeCollections) {
        const codeRef = doc(this.firestore, `${collection.name}/${code}`);
        const codeSnap = await getDoc(codeRef);

        if (codeSnap.exists()) {
          await deleteDoc(codeRef);
          return {
            found: true,
            division: collection.division,
            collection: collection.name
          };
        }
      }
      return { found: false };
    } catch (error) {
      console.error('Error validating code:', error);
      return { found: false };
    }
  }
}
