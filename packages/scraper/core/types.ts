export interface ScrapedProduct {
    externalId: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    url: string;
    ean?: string;
    category?: string;
    available: boolean;
}
