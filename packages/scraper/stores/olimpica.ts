import { ScrapedProduct } from "../core/types";

export const OLIMPICA = {
    name: "Supermercados Olímpica",
    baseUrl: "https://www.olimpica.com",
    category: "Supermercado",

    async scrape(): Promise<ScrapedProduct[]> {
        return [
            {
                externalId: "oli-001",
                name: "Arroz Supremo Tradicional 1kg",
                price: 3500,
                url: "https://www.olimpica.com/arroz-supremo",
                available: true,
                category: "Despensa"
            }
        ];
    }
};
