import { FavoriteItem } from "../domain/types";
import { getFavorites, addFavorite, removeFavorite, isFavorite } from "../repositories";

export async function listFavorites(userId: string) {
    return getFavorites(userId);
}

export async function toggleFavorite(
    userId: string,
    productId: string,
    productName: string,
    productSlug: string,
    brand?: string
): Promise<{ favorited: boolean }> {
    const already = await isFavorite(userId, productId);

    if (already) {
        await removeFavorite(userId, productId);
        return { favorited: false };
    }

    await addFavorite({
        id: crypto.randomUUID(),
        userId,
        productId,
        productName,
        productSlug,
        brand,
        lastChecked: new Date(),
        createdAt: new Date()
    });

    return { favorited: true };
}
