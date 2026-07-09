import { ImageClassification } from "../domain/types";

const categoryPatterns: Record<string, RegExp[]> = {
    "Alimentos": [/arroz/i, /leche/i, /pan/i, /aceite/i, /harina/i],
    "Bebidas": [/gaseosa/i, /jugo/i, /agua/i, /cerveza/i],
    "Farmacia": [/acetaminofen/i, /ibuprofeno/i, /crema/i, /jarabe/i],
    "Aseo": [/jabon/i, /shampoo/i, /detergente/i, /limpido/i],
};

export function classifyImage(text: string): ImageClassification {
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
        for (const pattern of patterns) {
            if (pattern.test(text)) {
                return {
                    label: category,
                    confidence: 0.75,
                    category,
                    quality: "medium"
                };
            }
        }
    }

    return {
        label: "Desconocido",
        confidence: 0.3,
        category: "General",
        quality: "low"
    };
}
