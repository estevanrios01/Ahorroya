export interface FavoriteItem {
    id: string;
    userId: string;
    productId: string;
    productName: string;
    productSlug: string;
    productImage?: string;
    brand?: string;
    currentPrice?: number;
    lastChecked: Date;
    createdAt: Date;
}
