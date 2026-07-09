export interface Promotion {
    id: string;
    productId: string;
    productName: string;
    storeId: string;
    storeName: string;
    originalPrice: number;
    promotionalPrice: number;
    discountPercent: number;
    description: string;
    startDate: Date;
    endDate: Date;
    active: boolean;
}

export interface PriceDrop {
    productId: string;
    productName: string;
    storeName: string;
    previousPrice: number;
    currentPrice: number;
    dropAmount: number;
    dropPercent: number;
    detectedAt: Date;
}
