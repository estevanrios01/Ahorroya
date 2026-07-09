import { BarcodeFormat } from "../types";

export function validateBarcode(code: string, format: BarcodeFormat): boolean {
    switch (format) {
        case "EAN-13":
            return /^\d{13}$/.test(code) && checkEan13Checksum(code);
        case "EAN-8":
            return /^\d{8}$/.test(code);
        case "UPC-A":
            return /^\d{12}$/.test(code);
        case "UPC-E":
            return /^\d{8}$/.test(code);
        case "GTIN":
            return /^\d{8,14}$/.test(code);
        case "CODE128":
            return code.length > 0 && code.length < 80;
        case "QR":
            return code.length > 0;
        default:
            return false;
    }
}

function checkEan13Checksum(code: string): boolean {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return check === parseInt(code[12]);
}

export function normalizeBarcode(code: string): string {
    return code.replace(/[^0-9]/g, "");
}
