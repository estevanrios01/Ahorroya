import { ScrapedProduct } from "../core/types";

export const CRUZ_VERDE = {
    name: "Cruz Verde",
    baseUrl: "https://www.cruzverde.com.co",
    category: "Farmacia",

    async scrape(): Promise<ScrapedProduct[]> {
        return [
            {
                externalId: "cv-001",
                name: "Acetaminofén MK 500mg x 30",
                price: 2850,
                url: "https://www.cruzverde.com.co/acetaminofen-mk",
                available: true,
                category: "Farmacia"
            },
            {
                externalId: "cv-002",
                name: "Ibuprofeno Genfar 400mg x 20",
                price: 4500,
                originalPrice: 5200,
                url: "https://www.cruzverde.com.co/ibuprofeno-genfar",
                available: true,
                category: "Farmacia"
            }
        ];
    }
};
