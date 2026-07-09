export interface ImageUpload {
    id: string;
    productId: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    width: number;
    height: number;
    buffer: Buffer;
}

export interface ImageVersion {
    id: string;
    imageId: string;
    format: "original" | "webp" | "avif" | "thumbnail";
    url: string;
    width: number;
    height: number;
    sizeBytes: number;
}

export interface ImageOcrResult {
    text: string;
    confidence: number;
    detectedPrice?: number;
    detectedName?: string;
    detectedBrand?: string;
    detectedBarcode?: string;
}

export interface ImageClassification {
    label: string;
    confidence: number;
    category: string;
    quality: "high" | "medium" | "low";
}
