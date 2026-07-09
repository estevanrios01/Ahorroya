export interface RawProduct {
    store: string;
    externalId: string;
    url: string;
    name: string;
    image?: string;
    price: bigint;
    previousPrice?: bigint;
    ean?: string;
    available: boolean;
    capturedAt: Date;
}

export interface NormalizedProduct {
    externalId: string;
    normalizedName: string;
    brand?: string;
    quantity?: number;
    unit?: string;
    ean?: string;
}
