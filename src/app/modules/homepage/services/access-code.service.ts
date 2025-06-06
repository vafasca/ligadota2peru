import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AccessCodeService {

  private readonly codeCollections = ['accessCodeAdm', 'accessCodeDiv1', 'accessCodeDiv2', 'accessCodeSubAdm', 'accessCodePlayer'];

  constructor(private firestore: Firestore) { }

  async validateAndDeleteCode(code: string): Promise<{ found: boolean; collection?: string }> {
    try {
      // Verificar en cada colección
      for (const collection of this.codeCollections) {
        const codeRef = doc(this.firestore, `${collection}/${code}`);
        const codeSnap = await getDoc(codeRef);

        if (codeSnap.exists()) {
          // eliminar el código después de validarlo
          // await deleteDoc(codeRef);
          return { found: true, collection };
        }
      }
      // Si no se encontró en ninguna colección
      return { found: false };
    } catch (error) {
      console.error('Error validating code:', error);
      return { found: false };
    }
  }
}
