export interface QualityScore {
    overall: number;
    name: number;
    brand: number;
    image: number;
    description: number;
    barcode: number;
    presentation: number;
    category: number;
    freshness: number;
}

export class QualityScorer {
    score(data: {
        name?: string;
        brand?: string;
        image?: string;
        description?: string;
        barcode?: string;
        presentation?: string;
        category?: string;
        updatedAt?: Date;
        sourceCount?: number;
    }): QualityScore {
        const name = data.name && data.name.length >= 3 ? 100 : data.name ? 50 : 0;
        const brand = data.brand ? 100 : 0;
        const image = data.image ? 100 : 0;
        const description = data.description && data.description.length > 20 ? 100 : data.description ? 60 : 0;
        const barcode = data.barcode && /^\d{8,13}$/.test(data.barcode) ? 100 : 0;
        const presentation = data.presentation ? 100 : 0;
        const category = data.category ? 100 : 0;

        const ageHours = data.updatedAt
            ? (Date.now() - data.updatedAt.getTime()) / 3600000
            : 9999;
        const freshness = Math.max(0, Math.round(100 - ageHours / 72));

        const overall = Math.round(
            (name + brand + image + description + barcode + presentation + category + freshness) / 8
        );

        return { overall, name, brand, image, description, barcode, presentation, category, freshness };
    }

    getLabel(score: number): string {
        if (score >= 90) return "Excelente";
        if (score >= 75) return "Bueno";
        if (score >= 50) return "Regular";
        if (score >= 25) return "Pendiente";
        return "Revisión Manual";
    }

    needsReview(score: number): boolean {
        return score < 50;
    }
}
