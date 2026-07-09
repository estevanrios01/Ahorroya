export type BarcodeType = "EAN-8" | "EAN-13" | "UPC-A" | "UPC-E" | "GTIN" | "CODE128";

export class BarcodeValue {
    private constructor(
        private readonly value: string,
        private readonly type: BarcodeType
    ) {
        if (!value) throw new Error("Barcode cannot be empty");
    }

    static create(value: string): BarcodeValue {
        const cleaned = value.replace(/[^0-9]/g, "");
        const type = this.detectType(cleaned);
        return new BarcodeValue(cleaned, type);
    }

    private static detectType(value: string): BarcodeType {
        if (value.length === 8) return "EAN-8";
        if (value.length === 12) return "UPC-A";
        if (value.length === 13) return "EAN-13";
        if (value.length === 8) return "UPC-E";
        if (value.length >= 8 && value.length <= 14) return "GTIN";
        return "CODE128";
    }

    getValue(): string { return this.value; }
    getType(): BarcodeType { return this.type; }
    equals(other: BarcodeValue): boolean { return this.value === other.value; }
}
