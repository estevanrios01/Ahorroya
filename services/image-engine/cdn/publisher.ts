import { ImageVersion } from "../domain/types";

const published = new Map<string, string>();

export async function publishToCdn(version: ImageVersion): Promise<string> {
    const url = `https://cdn.ahorroya.com/images/${version.imageId}/${version.format}/${version.id}`;
    published.set(version.id, url);
    return url;
}

export async function invalidateCache(imageId: string): Promise<void> {
    for (const [id] of published) {
        if (id.startsWith(imageId)) {
            published.delete(id);
        }
    }
}

export function getPublishedUrl(versionId: string): string | undefined {
    return published.get(versionId);
}
