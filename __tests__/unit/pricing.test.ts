import { isPriceAnomaly } from "../../packages/pricing-engine/price-anomaly";
import { priceTrend } from "../../packages/pricing-engine/price-trend";
import { basketComparison } from "../../packages/pricing-engine/basket-comparison";

describe("Pricing Engine", () => {
    it("detects price anomalies", () => {
        expect(isPriceAnomaly(1000, 1700)).toBe(true);
        expect(isPriceAnomaly(1000, 1100)).toBe(false);
    });

    it("determines price trend", () => {
        expect(priceTrend([1000, 1100, 1200])).toBe("up");
        expect(priceTrend([1200, 1100, 1000])).toBe("down");
        expect(priceTrend([1000, 1000, 1000])).toBe("stable");
    });

    it("finds cheapest basket", () => {
        const result = basketComparison([
            { store: "Éxito", total: 50000 },
            { store: "D1", total: 42000 },
            { store: "Olímpica", total: 55000 }
        ]);
        expect(result.cheapest.store).toBe("D1");
        expect(result.expensive.store).toBe("Olímpica");
    });
});
