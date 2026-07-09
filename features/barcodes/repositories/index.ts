import { BarcodeData, BarcodeScan } from "../types";

const barcodeStore = new Map<string, BarcodeData>();
const scanStore: BarcodeScan[] = [];

export async function findByCode(code: string): Promise<BarcodeData | undefined> {
    return barcodeStore.get(code);
}

export async function saveBarcode(data: BarcodeData): Promise<void> {
    barcodeStore.set(data.code, data);
}

export async function saveScan(scan: BarcodeScan): Promise<void> {
    scanStore.push(scan);
}

export async function getScanHistory(limit = 50): Promise<BarcodeScan[]> {
    return scanStore.slice(-limit).reverse();
}
