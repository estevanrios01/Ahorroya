import { BarcodeData, BarcodeScan, BarcodeFormat } from "../types";
import { validateBarcode, normalizeBarcode } from "../validators";
import { findByCode, saveBarcode, saveScan } from "../repositories";

export async function scanBarcode(
    code: string,
    format: BarcodeFormat,
    userId?: string
): Promise<{
    data: BarcodeData | undefined;
    scan: BarcodeScan;
    valid: boolean;
}> {
    const normalized = normalizeBarcode(code);
    const valid = validateBarcode(normalized, format);

    const scan: BarcodeScan = {
        id: crypto.randomUUID(),
        code: normalized,
        format,
        userId,
        scannedAt: new Date()
    };

    await saveScan(scan);

    let data: BarcodeData | undefined = await findByCode(normalized);

    if (!data && valid) {
        data = {
            code: normalized,
            format,
            verified: false,
            capturedAt: new Date()
        };
        await saveBarcode(data);
    }

    return { data, scan, valid };
}
