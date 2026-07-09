import { ScrapedProduct } from "../core/types";

export const FARMATODO = {
    name: "Farmatodo",
    baseUrl: "https://www.farmatodo.com.co",
    category: "Farmacia",

    async scrape(): Promise<ScrapedProduct[]> {
        return [
            {
                externalId: "ft-001",
                name: "Acetaminofén MK 500mg x 30",
                price: 2980,
                url: "https://www.farmatodo.com.co/acetaminofen-mk",
                available: true,
                category: "Farmacia"
            }
        ];
    }
};
