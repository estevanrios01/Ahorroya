export interface ShoppingItem {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    priority: number;
    notes?: string;
}

export interface ShoppingList {
    id: string;
    userId: string;
    name: string;
    items: ShoppingItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface OptimizationResult {
    store: string;
    totalCost: number;
    items: Array<{ productId: string; productName: string; price: number; quantity: number }>;
    savings: number;
    distance: number;
    route: string[];
}

export class ShoppingEngine {
    private lists: ShoppingList[] = [];

    createList(userId: string, name: string): ShoppingList {
        const list: ShoppingList = {
            id: crypto.randomUUID(),
            userId,
            name,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.lists.push(list);
        return list;
    }

    addItem(listId: string, item: ShoppingItem): ShoppingList | null {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return null;
        list.items.push(item);
        list.updatedAt = new Date();
        return list;
    }

    removeItem(listId: string, productId: string): ShoppingList | null {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return null;
        list.items = list.items.filter(i => i.productId !== productId);
        list.updatedAt = new Date();
        return list;
    }

    getList(listId: string): ShoppingList | null {
        return this.lists.find(l => l.id === listId) || null;
    }

    getUserLists(userId: string): ShoppingList[] {
        return this.lists.filter(l => l.userId === userId);
    }

    optimize(
        listId: string,
        storePrices: Map<string, Map<string, number>>,
        storeDistances: Map<string, number>
    ): OptimizationResult[] {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return [];

        const results: OptimizationResult[] = [];

        for (const [store, prices] of storePrices) {
            let totalCost = 0;
            const items: OptimizationResult["items"] = [];

            for (const item of list.items) {
                const price = prices.get(item.productId);
                if (price !== undefined) {
                    totalCost += price * item.quantity;
                    items.push({
                        productId: item.productId,
                        productName: item.productName,
                        price,
                        quantity: item.quantity,
                    });
                }
            }

            const distance = storeDistances.get(store) || 0;

            results.push({
                store,
                totalCost: Math.round(totalCost * 100) / 100,
                items,
                savings: 0,
                distance,
                route: [store],
            });
        }

        const minCost = Math.min(...results.map(r => r.totalCost));
        results.forEach(r => {
            r.savings = Math.round((minCost > 0 ? r.totalCost - minCost : 0) * 100) / 100;
        });

        return results.sort((a, b) => a.totalCost - b.totalCost);
    }
}
