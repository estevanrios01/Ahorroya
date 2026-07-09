import { SearchDocument } from "./document";

class MemoryIndex {
  private documents = new Map<string, SearchDocument>();

  set(document: SearchDocument) {
    this.documents.set(document.id, document);
  }

  get(id: string) {
    return this.documents.get(id);
  }

  all() {
    return [...this.documents.values()];
  }

  clear() {
    this.documents.clear();
  }
}

export const searchIndex = new MemoryIndex();
