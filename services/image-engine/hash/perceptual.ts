import { createHash } from "node:crypto";

export function perceptualHash(buffer: Buffer): string {
    return createHash("sha256")
        .update(buffer)
        .digest("hex")
        .slice(0, 16);
}

export function hammingDistance(hash1: string, hash2: string): number {
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) distance++;
    }
    return distance;
}

export function isDuplicate(hash1: string, hash2: string, threshold = 3): boolean {
    return hammingDistance(hash1, hash2) <= threshold;
}
