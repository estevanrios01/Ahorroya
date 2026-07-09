import { Promotion, PriceDrop } from "../domain/types";
import { getActivePromotions, getBiggestDiscounts, getRecentDrops, addPromotion, recordPriceDrop } from "../repositories";

export async function listActivePromotions(limit = 20) {
    return getActivePromotions(limit);
}

export async function listBiggestDiscounts(limit = 10) {
    return getBiggestDiscounts(limit);
}

export async function listRecentDrops(limit = 20) {
    return getRecentDrops(limit);
}

export async function createPromotion(data: Omit<Promotion, "id">): Promise<Promotion> {
    const promotion: Promotion = { ...data, id: crypto.randomUUID() };
    await addPromotion(promotion);
    return promotion;
}

export async function detectPriceDrop(
    productId: string,
    productName: string,
    storeName: string,
    previousPrice: number,
    currentPrice: number
): Promise<PriceDrop | null> {
    if (currentPrice >= previousPrice) return null;

    const drop: PriceDrop = {
        productId,
        productName,
        storeName,
        previousPrice,
        currentPrice,
        dropAmount: previousPrice - currentPrice,
        dropPercent: Math.round(((previousPrice - currentPrice) / previousPrice) * 100),
        detectedAt: new Date()
    };

    await recordPriceDrop(drop);
    return drop;
}
