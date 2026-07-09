export interface QualityScore {
    completeness: number;
    consistency: number;
    reliability: number;
    freshness: number;
    total: number;
}

export function calculateScore(record: {
    fields: Record<string, unknown>;
    updatedAt: Date;
    source: string;
}): QualityScore {
    const totalFields = Object.keys(record.fields).length;
    const filledFields = Object.values(record.fields).filter((v) => v !== null && v !== undefined && v !== "").length;
    const completeness = totalFields > 0 ? filledFields / totalFields : 0;

    const ageHours = (Date.now() - record.updatedAt.getTime()) / (1000 * 3600);
    const freshness = Math.max(0, 1 - ageHours / 720);

    const sourceReliability: Record<string, number> = {
        scraper: 0.7,
        api: 0.9,
        user: 0.5,
        admin: 1.0
    };
    const reliability = sourceReliability[record.source] || 0.5;

    const consistency = Math.min(completeness + 0.1, 1);

    const total = Math.round((completeness + consistency + reliability + freshness) / 4 * 100);

    return {
        completeness: Math.round(completeness * 100),
        consistency: Math.round(consistency * 100),
        reliability: Math.round(reliability * 100),
        freshness: Math.round(freshness * 100),
        total
    };
}
