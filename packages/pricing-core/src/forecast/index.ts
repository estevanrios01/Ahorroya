export interface Forecast {
    productId: string;
    currentPrice: number;
    predictedPrices: Array<{ day: number; price: number }>;
    confidence: number;
    trend: "up" | "down" | "stable";
    recommendation: string;
}

export class ForecastService {
    forecast(
        productId: string,
        history: number[],
        days: number = 30
    ): Forecast {
        if (history.length < 3) {
            return {
                productId,
                currentPrice: history[history.length - 1] || 0,
                predictedPrices: [],
                confidence: 0.3,
                trend: "stable",
                recommendation: "Datos insuficientes para predicción",
            };
        }

        const recent = history.slice(-7);
        const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const lastPrice = history[history.length - 1];
        const trend = lastPrice > avg ? "up" : lastPrice < avg ? "down" : "stable";

        const dailyVariation = trend === "up" ? 1.002 : trend === "down" ? 0.998 : 1;
        const predictedPrices: Array<{ day: number; price: number }> = [];
        let current = lastPrice;

        for (let d = 1; d <= days; d++) {
            current = Math.round(current * dailyVariation * 100) / 100;
            predictedPrices.push({ day: d, price: current });
        }

        const confidence = Math.min(0.3 + history.length * 0.02, 0.85);
        const recommendation = trend === "down"
            ? "El precio está en tendencia a la baja. Recomendamos esperar."
            : trend === "up"
            ? "El precio está subiendo. Recomendamos comprar pronto."
            : "El precio se mantiene estable. Puedes comprar cuando quieras.";

        return {
            productId,
            currentPrice: lastPrice,
            predictedPrices,
            confidence,
            trend,
            recommendation,
        };
    }
}
