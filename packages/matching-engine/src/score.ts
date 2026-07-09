export interface MatchResult {
    confidence: number;
    strategy: string;
    matched: boolean;
}

export class BarcodeMatchStrategy {
    match(barcode1?: string, barcode2?: string): MatchResult {
        if (!barcode1 || !barcode2) {
            return { confidence: 0, strategy: "barcode", matched: false };
        }
        const matched = barcode1 === barcode2;
        return {
            confidence: matched ? 100 : 0,
            strategy: "barcode",
            matched
        };
    }
}

export class ExactNameStrategy {
    match(name1: string, name2: string): MatchResult {
        const matched = name1.toLowerCase().trim() === name2.toLowerCase().trim();
        return {
            confidence: matched ? 100 : 0,
            strategy: "exact-name",
            matched
        };
    }
}

export class NormalizedNameStrategy {
    match(name1: string, name2: string): MatchResult {
        const normalize = (s: string) =>
            s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const matched = normalize(name1) === normalize(name2);
        return {
            confidence: matched ? 98 : 0,
            strategy: "normalized-name",
            matched
        };
    }
}

export class BrandStrategy {
    match(brand1?: string, brand2?: string): MatchResult {
        if (!brand1 || !brand2) {
            return { confidence: 0, strategy: "brand", matched: false };
        }
        const matched = brand1.toLowerCase().trim() === brand2.toLowerCase().trim();
        return {
            confidence: matched ? 100 : 0,
            strategy: "brand",
            matched
        };
    }
}

export class PresentationStrategy {
    match(size1?: string, size2?: string): MatchResult {
        if (!size1 || !size2) {
            return { confidence: 0, strategy: "presentation", matched: false };
        }
        const normalizeSize = (s: string) =>
            s.toLowerCase().replace(/\s+/g, "").replace(/[^0-9a-z]/g, "");
        const matched = normalizeSize(size1) === normalizeSize(size2);
        return {
            confidence: matched ? 100 : 0,
            strategy: "presentation",
            matched
        };
    }
}

export class HybridStrategy {
    private strategies = [
        new BarcodeMatchStrategy(),
        new ExactNameStrategy(),
        new NormalizedNameStrategy(),
        new BrandStrategy(),
        new PresentationStrategy(),
    ];

    match(data: {
        barcode1?: string; barcode2?: string;
        name1: string; name2: string;
        brand1?: string; brand2?: string;
        size1?: string; size2?: string;
    }): { confidence: number; results: MatchResult[] } {
        const results = this.strategies.map((s) => {
            if (s instanceof BarcodeMatchStrategy) {
                return s.match(data.barcode1, data.barcode2);
            }
            if (s instanceof ExactNameStrategy) {
                return s.match(data.name1, data.name2);
            }
            if (s instanceof NormalizedNameStrategy) {
                return s.match(data.name1, data.name2);
            }
            if (s instanceof BrandStrategy) {
                return s.match(data.brand1, data.brand2);
            }
            if (s instanceof PresentationStrategy) {
                return s.match(data.size1, data.size2);
            }
            return { confidence: 0, strategy: "unknown", matched: false };
        });

        const weights: Record<string, number> = {
            "barcode": 1.0,
            "exact-name": 0.9,
            "normalized-name": 0.7,
            "brand": 0.5,
            "presentation": 0.6,
        };

        let totalWeight = 0;
        let weightedSum = 0;

        for (const r of results) {
            const w = weights[r.strategy] || 0.5;
            totalWeight += w;
            weightedSum += r.confidence * w;
        }

        const confidence = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

        return { confidence, results };
    }
}
