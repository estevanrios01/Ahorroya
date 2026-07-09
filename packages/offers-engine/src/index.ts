export type OfferType =
    | "discount" | "2x1" | "3x2" | "4x3"
    | "second_unit" | "coupon" | "cashback"
    | "points" | "liquidation"
    | "black_friday" | "cyber" | "anniversary";

export interface Offer {
    id: string;
    productId: string;
    productName: string;
    storeId: string;
    storeName: string;
    type: OfferType;
    originalPrice: number;
    offerPrice: number;
    discountPercent: number;
    startDate: Date;
    endDate: Date;
    conditions?: string;
    active: boolean;
}

export class OffersEngine {
    private offers: Offer[] = [];

    register(offer: Omit<Offer, "id" | "discountPercent">): Offer {
        const discountPercent = offer.originalPrice > 0
            ? Math.round(((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100)
            : 0;

        const newOffer: Offer = {
            ...offer,
            id: crypto.randomUUID(),
            discountPercent,
        };

        this.offers.push(newOffer);
        return newOffer;
    }

    getActive(): Offer[] {
        const now = new Date();
        return this.offers
            .filter(o => o.active && new Date(o.startDate) <= now && new Date(o.endDate) >= now)
            .sort((a, b) => b.discountPercent - a.discountPercent);
    }

    getTop(limit = 10): Offer[] {
        return this.getActive().slice(0, limit);
    }

    getByProduct(productId: string): Offer[] {
        return this.offers.filter(o => o.productId === productId && o.active);
    }

    getByStore(storeId: string): Offer[] {
        return this.offers.filter(o => o.storeId === storeId && o.active);
    }

    detectFakeOffer(offer: Offer): boolean {
        if (offer.discountPercent > 95) return true;
        if (offer.offerPrice <= 0) return true;
        return false;
    }

    getRealSavings(offer: Offer): number {
        if (this.detectFakeOffer(offer)) return 0;
        return offer.originalPrice - offer.offerPrice;
    }
}
