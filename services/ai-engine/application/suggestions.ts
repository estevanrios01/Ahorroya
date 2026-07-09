import { SearchSuggestion } from "../domain/types";

const corrections: Record<string, string> = {
    "acetaminofen": "Acetaminofén",
    "ibuprofeno": "Ibuprofeno",
    "dole": "Dolex",
    "dolex": "Dolex",
    "arros": "Arroz",
    "lche": "Leche",
    "panela": "Panela",
    "cafe": "Café",
};

const synonyms: Record<string, string[]> = {
    "dolor": ["Acetaminofén", "Ibuprofeno", "Naproxeno"],
    "fiebre": ["Acetaminofén", "Ibuprofeno"],
    "cabeza": ["Acetaminofén", "Dolex"],
    "desayuno": ["Café", "Pan", "Leche"],
    "aseo": ["Jabón", "Shampoo", "Detergente"],
};

export function suggest(query: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const lower = query.toLowerCase().trim();

    if (!lower || lower.length < 2) return suggestions;

    if (corrections[lower]) {
        suggestions.push({
            query: lower,
            corrected: corrections[lower],
            type: "correction",
            confidence: 0.95
        });
    }

    for (const [key, values] of Object.entries(synonyms)) {
        if (lower.includes(key) || key.includes(lower)) {
            for (const value of values.slice(0, 3)) {
                suggestions.push({
                    query: lower,
                    corrected: value,
                    type: "synonym",
                    confidence: 0.7
                });
            }
        }
    }

    return suggestions;
}
