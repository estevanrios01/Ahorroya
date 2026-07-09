export interface PriceEventData {
    id: string;
    masterProductId: string;
    storeProductId?: string;
    storeId: string;
    branchId?: string;
    capturedAt: Date;
    price: number;
    regularPrice?: number;
    offerPrice?: number;
    currency: string;
    promotionId?: string;
    inventoryStatus: string;
    source: string;
    scraperJobId?: string;
    confidence: number;
    verified: boolean;
}

export class PriceEvent {
    private constructor(private data: PriceEventData) {}

    static create(data: Omit<PriceEventData, "id" | "capturedAt">): PriceEvent {
        return new PriceEvent({
            ...data,
            id: crypto.randomUUID(),
            capturedAt: new Date()
        });
    }

    static restore(data: PriceEventData): PriceEvent {
        return new PriceEvent(data);
    }

    getId(): string { return this.data.id; }
    getMasterProductId(): string { return this.data.masterProductId; }
    getStoreId(): string { return this.data.storeId; }
    getPrice(): number { return this.data.price; }
    getRegularPrice(): number | undefined { return this.data.regularPrice; }
    getOfferPrice(): number | undefined { return this.data.offerPrice; }
    getCapturedAt(): Date { return this.data.capturedAt; }
    getSource(): string { return this.data.source; }
    getConfidence(): number { return this.data.confidence; }
    getInventoryStatus(): string { return this.data.inventoryStatus; }

    hasDiscount(): boolean {
        if (this.data.offerPrice !== undefined) return true;
        if (this.data.regularPrice !== undefined) {
            return this.data.price < this.data.regularPrice;
        }
        return false;
    }

    discountPercent(): number {
        const base = this.data.regularPrice || this.data.price;
        if (base === 0) return 0;
        return Math.round(((base - this.data.price) / base) * 100);
    }

    toJSON(): PriceEventData { return { ...this.data }; }
}
