import { PricePrediction } from "../domain/types";

export function predictPrice(
    productId: string,
    history: number[],
    currentPrice: number
): PricePrediction {
    if (history.length < 3) {
        return {
            productId,
            currentPrice,
            predictedPrice: currentPrice,
            predictedDate: new Date(Date.now() + 7 * 86400000),
            confidence: 0.3,
            trend: "stable"
        };
    }

    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    const recentAvg = history.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const trend = recentAvg > avg ? "up" : recentAvg < avg ? "down" : "stable";
    const variation = trend === "up" ? 1.05 : trend === "down" ? 0.95 : 1;
    const predictedPrice = Math.round(currentPrice * variation);
    const confidence = Math.min(0.3 + history.length * 0.05, 0.85);

    return {
        productId,
        currentPrice,
        predictedPrice,
        predictedDate: new Date(Date.now() + 7 * 86400000),
        confidence,
        trend
    };
}
