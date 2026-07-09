import { ProductName } from "../value-objects/product-name";
import { Slug } from "../value-objects/slug";
import { BarcodeValue } from "../value-objects/barcode-value";

export interface MasterProductProps {
    id: string;
    name: ProductName;
    canonicalName: ProductName;
    normalizedName: string;
    searchName: string;
    slug: Slug;
    brandId?: string;
    manufacturerId?: string;
    categoryId?: string;
    subcategoryId?: string;
    barcodePrimary?: BarcodeValue;
    imagePrimary?: string;
    description?: string;
    confidenceScore: number;
    qualityScore: number;
    popularityScore: number;
    searchScore: number;
    aiGenerated: boolean;
    verified: boolean;
    sourceCount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export class MasterProduct {
    private constructor(private props: MasterProductProps) {}

    static create(props: Omit<MasterProductProps, "id" | "createdAt" | "updatedAt" | "confidenceScore" | "qualityScore" | "popularityScore" | "searchScore" | "sourceCount">): MasterProduct {
        return new MasterProduct({
            ...props,
            id: crypto.randomUUID(),
            confidenceScore: 0,
            qualityScore: 0,
            popularityScore: 0,
            searchScore: 0,
            sourceCount: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    static restore(props: MasterProductProps): MasterProduct {
        return new MasterProduct(props);
    }

    getId(): string { return this.props.id; }
    getName(): ProductName { return this.props.name; }
    getCanonicalName(): ProductName { return this.props.canonicalName; }
    getSlug(): Slug { return this.props.slug; }
    getBrandId(): string | undefined { return this.props.brandId; }
    getCategoryId(): string | undefined { return this.props.categoryId; }
    getConfidenceScore(): number { return this.props.confidenceScore; }
    getQualityScore(): number { return this.props.qualityScore; }
    getPopularityScore(): number { return this.props.popularityScore; }
    isVerified(): boolean { return this.props.verified; }
    isAiGenerated(): boolean { return this.props.aiGenerated; }
    getSourceCount(): number { return this.props.sourceCount; }

    updateScores(confidence: number, quality: number, popularity: number, search: number): void {
        this.props.confidenceScore = confidence;
        this.props.qualityScore = quality;
        this.props.popularityScore = popularity;
        this.props.searchScore = search;
        this.props.updatedAt = new Date();
    }

    incrementSourceCount(): void {
        this.props.sourceCount++;
        this.props.updatedAt = new Date();
    }

    verify(): void {
        this.props.verified = true;
        this.props.updatedAt = new Date();
    }

    attachImage(url: string): void {
        this.props.imagePrimary = url;
        this.props.updatedAt = new Date();
    }

    toJSON(): MasterProductProps {
        return { ...this.props };
    }
}
