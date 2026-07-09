import { FavoriteItem } from "../domain/types";

const favorites = new Map<string, FavoriteItem[]>();

export async function getFavorites(userId: string): Promise<FavoriteItem[]> {
    return favorites.get(userId) || [];
}

export async function addFavorite(item: FavoriteItem): Promise<void> {
    const userFavs = favorites.get(item.userId) || [];
    const exists = userFavs.find((f) => f.productId === item.productId);
    if (!exists) {
        userFavs.push(item);
        favorites.set(item.userId, userFavs);
    }
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
    const userFavs = favorites.get(userId) || [];
    favorites.set(
        userId,
        userFavs.filter((f) => f.productId !== productId)
    );
}

export async function isFavorite(userId: string, productId: string): Promise<boolean> {
    const userFavs = favorites.get(userId) || [];
    return userFavs.some((f) => f.productId === productId);
}
