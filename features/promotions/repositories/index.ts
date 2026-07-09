import { Promotion, PriceDrop } from "../domain/types";

const promotions = new Map<string, Promotion[]>();
const drops: PriceDrop[] = [];

export async function getActivePromotions(limit = 20): Promise<Promotion[]> {
    const all: Promotion[] = [];
    for (const storePromos of promotions.values()) {
        all.push(...storePromos.filter((p) => p.active));
    }
    return all
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, limit);
}

export async function addPromotion(promotion: Promotion): Promise<void> {
    const storePromos = promotions.get(promotion.storeId) || [];
    storePromos.push(promotion);
    promotions.set(promotion.storeId, storePromos);
}

export async function recordPriceDrop(drop: PriceDrop): Promise<void> {
    drops.push(drop);
}

export async function getRecentDrops(limit = 20): Promise<PriceDrop[]> {
    return drops.slice(-limit).reverse();
}

export async function getBiggestDiscounts(limit = 10): Promise<Promotion[]> {
    const all: Promotion[] = [];
    for (const storePromos of promotions.values()) {
        all.push(...storePromos.filter((p) => p.active));
    }
    return all
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, limit);
}
