export interface AIRecommendation {
    productId: string;
    productName: string;
    currentPrice: number;
    predictedPrice: number;
    recommendation: "comprar" | "esperar" | "alternativa";
    reason: string;
    confidence: number;
}

export interface PricePrediction {
    productId: string;
    currentPrice: number;
    predictedPrice: number;
    predictedDate: Date;
    confidence: number;
    trend: "up" | "down" | "stable";
}

export interface AlternativeProduct {
    originalId: string;
    originalName: string;
    originalPrice: number;
    alternativeId: string;
    alternativeName: string;
    alternativePrice: number;
    savings: number;
    savingsPercent: number;
}

export interface SearchSuggestion {
    query: string;
    corrected: string;
    type: "correction" | "synonym" | "category";
    confidence: number;
}
