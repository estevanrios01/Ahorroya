import { SearchDocument } from "./document";
import { buildIndex } from "./builder";

export async function loadIndex(
  fetchDocuments: () => Promise<SearchDocument[]>
) {
  const documents = await fetchDocuments();
  buildIndex(documents);
  return documents.length;
}
