import { SearchDocument } from "./document";

export function ranking(query: string[], documents: SearchDocument[]) {
  return documents
    .map((document) => {
      const matches = document.tokens.filter((token) =>
        query.includes(token)
      ).length;
      return { document, score: matches / query.length };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}
