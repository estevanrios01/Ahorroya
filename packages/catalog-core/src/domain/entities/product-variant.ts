import { PresentationSize } from "../value-objects/presentation-size";
import { Money } from "../value-objects/money";

export interface ProductVariantProps {
    id: string;
    masterProductId: string;
    name: string;
    size: PresentationSize;
    barcode?: string;
    price: Money;
    image?: string;
    isPrimary: boolean;
    status: string;
    createdAt: Date;
}

export class ProductVariant {
    private constructor(private props: ProductVariantProps) {}

    static create(props: Omit<ProductVariantProps, "id" | "createdAt">): ProductVariant {
        return new ProductVariant({
            ...props,
            id: crypto.randomUUID(),
            createdAt: new Date()
        });
    }

    static restore(props: ProductVariantProps): ProductVariant {
        return new ProductVariant(props);
    }

    getId(): string { return this.props.id; }
    getMasterProductId(): string { return this.props.masterProductId; }
    getName(): string { return this.props.name; }
    getSize(): PresentationSize { return this.props.size; }
    getPrice(): Money { return this.props.price; }
    getUnitPrice(): Money {
        const baseUnits = this.props.size.toBaseUnit();
        return this.props.price.multiply(1 / baseUnits);
    }

    toJSON(): ProductVariantProps { return { ...this.props }; }
}
