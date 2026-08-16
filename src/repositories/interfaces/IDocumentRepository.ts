export interface ExtractedDocumentRecord {
  id: string;
  title: string;
  fields: Array<{ key: string; value: string; confidence: number }>;
  timestamp: string;
  category?: string;
  verified?: boolean;
}

export interface IDocumentRepository {
  getAllDocuments(): Promise<ExtractedDocumentRecord[]>;
  addDocument(doc: ExtractedDocumentRecord): Promise<void>;
  subscribeToDocuments(callback: (docs: ExtractedDocumentRecord[]) => void): () => void;
}
