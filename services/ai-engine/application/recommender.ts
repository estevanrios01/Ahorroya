import { AIRecommendation, AlternativeProduct } from "../domain/types";

export function recommend(
    productId: string,
    productName: string,
    currentPrice: number,
    history: number[],
    alternatives: Array<{ id: string; name: string; price: number }>
): AIRecommendation & { alternatives: AlternativeProduct[] } {
    const avgPrice = history.length > 0
        ? history.reduce((a, b) => a + b, 0) / history.length
        : currentPrice;

    let recommendation: AIRecommendation["recommendation"] = "comprar";
    let reason = "El precio actual es competitivo.";
    let confidence = 0.7;

    if (currentPrice < avgPrice * 0.85) {
        recommendation = "comprar";
        reason = "El precio está significativamente por debajo del promedio histórico.";
        confidence = 0.9;
    } else if (currentPrice > avgPrice * 1.15) {
        recommendation = "esperar";
        reason = "El precio está por encima del promedio. Podría bajar pronto.";
        confidence = 0.75;
    }

    const alternativeList: AlternativeProduct[] = alternatives
        .filter((a) => a.price < currentPrice)
        .map((a) => ({
            originalId: productId,
            originalName: productName,
            originalPrice: currentPrice,
            alternativeId: a.id,
            alternativeName: a.name,
            alternativePrice: a.price,
            savings: currentPrice - a.price,
            savingsPercent: Math.round(((currentPrice - a.price) / currentPrice) * 100)
        }))
        .sort((a, b) => b.savings - a.savings);

    return {
        productId,
        productName,
        currentPrice,
        predictedPrice: avgPrice,
        recommendation,
        reason,
        confidence,
        alternatives: alternativeList
    };
}
