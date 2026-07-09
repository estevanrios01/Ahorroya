import { searchIndex } from "./memory";
import { SearchDocument } from "./document";

export function buildIndex(documents: SearchDocument[]) {
  searchIndex.clear();
  for (const document of documents) {
    searchIndex.set(document);
  }
}
