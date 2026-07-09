export type BarcodeFormat =
    | "EAN-8"
    | "EAN-13"
    | "UPC-A"
    | "UPC-E"
    | "GTIN"
    | "CODE128"
    | "QR";

export interface BarcodeData {
    code: string;
    format: BarcodeFormat;
    productId?: string;
    productName?: string;
    brand?: string;
    verified: boolean;
    capturedAt: Date;
}

export interface BarcodeScan {
    id: string;
    code: string;
    format: BarcodeFormat;
    userId?: string;
    latitude?: number;
    longitude?: number;
    scannedAt: Date;
}
