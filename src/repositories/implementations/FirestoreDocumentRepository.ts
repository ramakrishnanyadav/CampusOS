import { IDocumentRepository, ExtractedDocumentRecord } from '../interfaces/IDocumentRepository';
import { db } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, onSnapshot } from 'firebase/firestore';

const DEFAULT_ORG_ID = 'org-central-high';
const LOCAL_KEY = 'campusos_extracted_documents';

export class FirestoreDocumentRepository implements IDocumentRepository {
  constructor(private orgId: string = DEFAULT_ORG_ID) {}

  private get collectionRef() {
    return collection(db, 'orgs', this.orgId, 'extracted_documents');
  }

  public async getAllDocuments(): Promise<ExtractedDocumentRecord[]> {
    try {
      const snap = await getDocs(this.collectionRef);
      if (!snap.empty) {
        const docs = snap.docs.map((d) => d.data() as ExtractedDocumentRecord);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(docs));
        return docs;
      }
    } catch (err) {
      console.warn(`FirestoreDocumentRepository[${this.orgId}]: Offline fallback`, err);
    }
    const cached = localStorage.getItem(LOCAL_KEY);
    return cached ? JSON.parse(cached) : [];
  }

  public async addDocument(docRecord: ExtractedDocumentRecord): Promise<void> {
    const recordWithOrg = { ...docRecord, orgId: this.orgId };
    const docs = await this.getAllDocuments();
    docs.unshift(recordWithOrg);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(docs));
    try {
      await setDoc(doc(db, 'orgs', this.orgId, 'extracted_documents', docRecord.id), recordWithOrg, { merge: true });
    } catch (err) {
      console.warn(`FirestoreDocumentRepository[${this.orgId}]: Offline saved`, err);
    }
  }

  public subscribeToDocuments(callback: (docs: ExtractedDocumentRecord[]) => void): () => void {
    try {
      return onSnapshot(this.collectionRef, (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map((d) => d.data() as ExtractedDocumentRecord);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(docs));
          callback(docs);
        }
      }, (err) => console.warn(`Document listener fallback[${this.orgId}]:`, err));
    } catch (e) {
      return () => {};
    }
  }
}
