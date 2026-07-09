export type ScraperStatus = "idle" | "running" | "paused" | "error" | "completed";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ScraperConfigV2 {
    id: string;
    name: string;
    storeId: string;
    baseUrl: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    rateLimitPerSecond: number;
    retryCount: number;
    retryDelayMs: number;
    timeoutMs: number;
    selectors: {
        product?: string;
        name?: string;
        price?: string;
        oldPrice?: string;
        image?: string;
        barcode?: string;
        brand?: string;
        nextPage?: string;
    };
    pagination?: {
        type: "url" | "button" | "scroll";
        param?: string;
        maxPages: number;
    };
}

export interface ScraperJobV2 {
    id: string;
    configId: string;
    status: ScraperStatus;
    progress: { current: number; total: number };
    startedAt: Date | null;
    completedAt: Date | null;
    error?: string;
    productsScraped: number;
}

interface ScrapedProduct {
    name: string;
    price: number;
    oldPrice?: number;
    imageUrl?: string;
    barcode?: string;
    brand?: string;
}

export class ScraperFrameworkV2 {
    private configs = new Map<string, ScraperConfigV2>();
    private jobs = new Map<string, ScraperJobV2>();

    registerConfig(config: ScraperConfigV2): void {
        this.configs.set(config.id, config);
    }

    startJob(configId: string): ScraperJobV2 {
        const config = this.configs.get(configId);
        if (!config) throw new Error(`Config ${configId} not found`);

        const job: ScraperJobV2 = {
            id: crypto.randomUUID(),
            configId,
            status: "running",
            progress: { current: 0, total: 100 },
            startedAt: new Date(),
            completedAt: null,
            productsScraped: 0,
        };

        this.jobs.set(job.id, job);
        return job;
    }

    pauseJob(jobId: string): void {
        const job = this.jobs.get(jobId);
        if (job && job.status === "running") {
            job.status = "paused";
        }
    }

    resumeJob(jobId: string): void {
        const job = this.jobs.get(jobId);
        if (job && job.status === "paused") {
            job.status = "running";
        }
    }

    completeJob(jobId: string, productsScraped: number): void {
        const job = this.jobs.get(jobId);
        if (job) {
            job.status = "completed";
            job.completedAt = new Date();
            job.productsScraped = productsScraped;
            job.progress = { current: job.progress.total, total: job.progress.total };
        }
    }

    failJob(jobId: string, error: string): void {
        const job = this.jobs.get(jobId);
        if (job) {
            job.status = "error";
            job.error = error;
            job.completedAt = new Date();
        }
    }

    getJob(jobId: string): ScraperJobV2 | undefined {
        return this.jobs.get(jobId);
    }

    getActiveJobs(): ScraperJobV2[] {
        return Array.from(this.jobs.values()).filter(
            j => j.status === "running" || j.status === "paused"
        );
    }

    simulateScrape(configId: string, products: ScrapedProduct[]): ScrapedProduct[] {
        return products;
    }
}
