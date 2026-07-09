import { ImageOcrResult } from "../domain/types";

const pricePattern = /\$\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g;
const barcodePattern = /(\d{8,13})/g;

export function extractText(buffer: Buffer): ImageOcrResult {
    const rawText = buffer.toString("utf-8");

    const prices: number[] = [];
    let match;
    while ((match = pricePattern.exec(rawText)) !== null) {
        const cleaned = match[1].replace(/\./g, "").replace(",", ".");
        prices.push(parseFloat(cleaned));
    }

    const barcodes: string[] = [];
    while ((match = barcodePattern.exec(rawText)) !== null) {
        barcodes.push(match[1]);
    }

    return {
        text: rawText,
        confidence: 0.85,
        detectedPrice: prices[0],
        detectedBarcode: barcodes[0]
    };
}
