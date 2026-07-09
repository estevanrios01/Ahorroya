import { SearchDocument } from "./document";

export function filterByCategory(
  documents: SearchDocument[],
  category: string
) {
  return documents.filter(
    (doc) => doc.category.toLowerCase() === category.toLowerCase()
  );
}

export function filterByPriceRange(
  documents: SearchDocument[],
  min?: bigint,
  max?: bigint
) {
  return documents.filter((doc) => {
    if (min !== undefined && doc.minimumPrice < min) return false;
    if (max !== undefined && doc.maximumPrice > max) return false;
    return true;
  });
}
