import { perceptualHash, hammingDistance } from "../hash/perceptual";
import { ImageUpload } from "../domain/types";

const hashRegistry = new Map<string, string[]>();

export function registerHash(imageId: string, buffer: Buffer): string {
    const hash = perceptualHash(buffer);
    const existing = hashRegistry.get(hash) || [];
    existing.push(imageId);
    hashRegistry.set(hash, existing);
    return hash;
}

export function findDuplicates(buffer: Buffer): string[] {
    const hash = perceptualHash(buffer);
    const duplicates: string[] = [];

    for (const [storedHash, ids] of hashRegistry) {
        if (hammingDistance(hash, storedHash) <= 3) {
            duplicates.push(...ids);
        }
    }

    return duplicates;
}

export function clearRegistry(): void {
    hashRegistry.clear();
}
