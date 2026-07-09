import { ScrapedProduct } from "../core/types";

export const JUMBO = {
    name: "Jumbo",
    baseUrl: "https://www.jumbo.com.co",
    category: "Supermercado",

    async scrape(): Promise<ScrapedProduct[]> {
        return [
            {
                externalId: "jumbo-001",
                name: "Arroz Diana Premium 1kg",
                price: 4400,
                originalPrice: 5000,
                url: "https://www.jumbo.com.co/arroz-diana",
                available: true,
                category: "Despensa"
            }
        ];
    }
};
