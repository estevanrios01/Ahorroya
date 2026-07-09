import { MasterProduct } from "../entities/master-product";
import { ProductVariant } from "../entities/product-variant";

export interface MasterProductRepository {
    findById(id: string): Promise<MasterProduct | null>;
    findBySlug(slug: string): Promise<MasterProduct | null>;
    findByBarcode(barcode: string): Promise<MasterProduct | null>;
    search(query: string, limit?: number): Promise<MasterProduct[]>;
    save(product: MasterProduct): Promise<void>;
    saveMany(products: MasterProduct[]): Promise<void>;
    delete(id: string): Promise<void>;
    count(): Promise<number>;
}

export interface ProductVariantRepository {
    findById(id: string): Promise<ProductVariant | null>;
    findByMasterProduct(masterProductId: string): Promise<ProductVariant[]>;
    save(variant: ProductVariant): Promise<void>;
    saveMany(variants: ProductVariant[]): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface BrandRepository {
    findById(id: string): Promise<{ id: string; name: string; slug: string } | null>;
    findByName(name: string): Promise<{ id: string; name: string; slug: string } | null>;
    save(brand: { id: string; name: string; slug: string }): Promise<void>;
}

export interface BarcodeRepository {
    findByCode(code: string): Promise<{ code: string; masterProductId: string } | null>;
    save(barcode: { code: string; masterProductId: string; type: string }): Promise<void>;
}

export interface ImageRepository {
    findByMasterProduct(masterProductId: string): Promise<Array<{ id: string; url: string; isPrimary: boolean }>>;
    save(image: { id: string; masterProductId: string; url: string; isPrimary: boolean }): Promise<void>;
}
