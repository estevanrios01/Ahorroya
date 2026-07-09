import { ScrapedProduct } from "../core/types";

export const CARULLA = {
    name: "Carulla",
    baseUrl: "https://www.carulla.com",
    category: "Supermercado",

    async scrape(): Promise<ScrapedProduct[]> {
        return [
            {
                externalId: "car-001",
                name: "Pan Bimbo Integral 500g",
                price: 5200,
                url: "https://www.carulla.com/pan-bimbo-integral",
                available: true,
                category: "Panadería"
            }
        ];
    }
};
