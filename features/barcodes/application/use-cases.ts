import { BarcodeFormat } from "../types";
import { scanBarcode } from "../services/scanner";
import { getScanHistory } from "../repositories";
import { findByCode } from "../repositories";

export async function handleScan(code: string, format: BarcodeFormat, userId?: string) {
    return scanBarcode(code, format, userId);
}

export async function handleSearch(code: string) {
    return findByCode(code);
}

export async function handleGetHistory(limit = 50) {
    return getScanHistory(limit);
}
