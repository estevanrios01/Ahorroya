import { ScrapedProduct } from "../core/types";

export const D1 = {
    name: "Tiendas D1",
    baseUrl: "https://www.tiendasd1.com",
    category: "Supermercado",

    async scrape(): Promise<ScrapedProduct[]> {
        return [
            {
                externalId: "d1-001",
                name: "Arroz Roa Fortificado 1kg",
                price: 3800,
                url: "https://www.tiendasd1.com/arroz-roa",
                available: true,
                category: "Despensa"
            },
            {
                externalId: "d1-002",
                name: "Leche Entera Colanta 1L",
                price: 2800,
                url: "https://www.tiendasd1.com/leche-colanta",
                available: true,
                category: "Lácteos"
            }
        ];
    }
};
