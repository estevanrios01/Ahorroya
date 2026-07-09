import { ScrapedProduct } from "./types";

export interface ScrapingJob {
    id: string;
    store: string;
    page: number;
    category?: string;
    products: ScrapedProduct[];
}
