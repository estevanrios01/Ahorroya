export interface BasketProduct {
    productId: string;
    quantity: number;
}

export interface ProductPrice {
    productId: string;
    storeId: string;
    store: string;
    price: number;
}

export interface BasketResult {
    store: string;
    total: number;
}
