export interface PriceAlert {
    id: string;
    productId: string;
    productName: string;
    storeName: string;
    previousPrice: number;
    currentPrice: number;
    dropPercent: number;
    type: "drop" | "promotion" | "lowest" | "back_in_stock";
    severity: "info" | "warning" | "critical";
    createdAt: Date;
}

export class AlertEngine {
    private alerts: PriceAlert[] = [];

    checkDrop(
        productId: string,
        productName: string,
        storeName: string,
        previousPrice: number,
        currentPrice: number
    ): PriceAlert | null {
        if (previousPrice <= currentPrice) return null;

        const dropPercent = Math.round(((previousPrice - currentPrice) / previousPrice) * 100);
        const thresholds = [
            { min: 50, severity: "critical" as const },
            { min: 30, severity: "warning" as const },
            { min: 20, severity: "warning" as const },
            { min: 10, severity: "info" as const },
            { min: 5, severity: "info" as const },
        ];

        const threshold = thresholds.find(t => dropPercent >= t.min);
        if (!threshold) return null;

        const alert: PriceAlert = {
            id: crypto.randomUUID(),
            productId,
            productName,
            storeName,
            previousPrice,
            currentPrice,
            dropPercent,
            type: "drop",
            severity: threshold.severity,
            createdAt: new Date(),
        };

        this.alerts.push(alert);
        return alert;
    }

    checkLowestPrice(
        productId: string,
        productName: string,
        storeName: string,
        price: number,
        historicalMin: number
    ): PriceAlert | null {
        if (price >= historicalMin) return null;

        const alert: PriceAlert = {
            id: crypto.randomUUID(),
            productId,
            productName,
            storeName,
            previousPrice: historicalMin,
            currentPrice: price,
            dropPercent: Math.round(((historicalMin - price) / historicalMin) * 100),
            type: "lowest",
            severity: "critical",
            createdAt: new Date(),
        };

        this.alerts.push(alert);
        return alert;
    }

    getRecentAlerts(limit = 20): PriceAlert[] {
        return this.alerts.slice(-limit).reverse();
    }

    getAlertsByProduct(productId: string): PriceAlert[] {
        return this.alerts.filter(a => a.productId === productId);
    }
}
