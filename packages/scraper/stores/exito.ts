import { ScrapedProduct } from "../core/types";

export const EXITO = {
    name: "Almacenes Éxito",
    baseUrl: "https://www.exito.com",
    category: "Supermercado",

    async scrape(): Promise<ScrapedProduct[]> {
        const products: ScrapedProduct[] = [
            {
                externalId: "exito-001",
                name: "Arroz Diana Premium 1kg",
                price: 4200,
                originalPrice: 4800,
                url: "https://www.exito.com/arroz-diana-premium",
                available: true,
                category: "Despensa"
            },
            {
                externalId: "exito-002",
                name: "Aceite Gourmet Familia 1000ml",
                price: 12500,
                originalPrice: 14000,
                url: "https://www.exito.com/aceite-gourmet-familia",
                available: true,
                category: "Despensa"
            }
        ];
        return products;
    }
};
