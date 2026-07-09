import { ScrapedProduct } from "../core/types";

export const ARA = {
    name: "Ara",
    baseUrl: "https://www.ara.com.co",
    category: "Supermercado",

    async scrape(): Promise<ScrapedProduct[]> {
        return [
            {
                externalId: "ara-001",
                name: "Arroz Diana Premium 1kg",
                price: 3950,
                url: "https://www.ara.com.co/arroz-diana",
                available: true,
                category: "Despensa"
            },
            {
                externalId: "ara-002",
                name: "Aceite Vegetal de Girasol 1000ml",
                price: 11800,
                url: "https://www.ara.com.co/aceite-girasol",
                available: true,
                category: "Despensa"
            }
        ];
    }
};
