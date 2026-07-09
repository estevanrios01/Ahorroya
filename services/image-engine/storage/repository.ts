import { ImageUpload, ImageVersion } from "../domain/types";

const images = new Map<string, ImageUpload>();
const versions = new Map<string, ImageVersion[]>();

export async function saveImage(image: ImageUpload): Promise<void> {
    images.set(image.id, image);
}

export async function saveVersion(version: ImageVersion): Promise<void> {
    const existing = versions.get(version.imageId) || [];
    existing.push(version);
    versions.set(version.imageId, existing);
}

export async function getImage(id: string): Promise<ImageUpload | undefined> {
    return images.get(id);
}

export async function getVersions(imageId: string): Promise<ImageVersion[]> {
    return versions.get(imageId) || [];
}

export async function deleteImage(id: string): Promise<void> {
    images.delete(id);
    versions.delete(id);
}
