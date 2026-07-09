export type FeatureFlag = {
    key: string;
    enabled: boolean;
    description: string;
    dependencies?: string[];
    owner?: string;
};

export class FeatureFlags {
    private flags = new Map<string, FeatureFlag>();

    constructor() {
        this.registerDefaults();
    }

    private registerDefaults(): void {
        this.flags.set("ai-recommendations", {
            key: "ai-recommendations",
            enabled: false,
            description: "Recomendaciones basadas en IA",
            owner: "ai-team",
        });
        this.flags.set("ocr-processing", {
            key: "ocr-processing",
            enabled: false,
            description: "Procesamiento OCR de imágenes",
            owner: "image-team",
        });
        this.flags.set("scrapers-automaticos", {
            key: "scrapers-automaticos",
            enabled: true,
            description: "Scrapers automáticos en segundo plano",
            owner: "scraping-team",
        });
        this.flags.set("search-v2", {
            key: "search-v2",
            enabled: false,
            description: "Motor de búsqueda versión 2",
            owner: "search-team",
        });
        this.flags.set("promotions-engine", {
            key: "promotions-engine",
            enabled: true,
            description: "Motor de ofertas y promociones",
            owner: "pricing-team",
        });
        this.flags.set("shopping-planner", {
            key: "shopping-planner",
            enabled: false,
            description: "Planificador de compras inteligente",
            owner: "product-team",
        });
        this.flags.set("route-optimizer", {
            key: "route-optimizer",
            enabled: false,
            description: "Optimizador de rutas de compra",
            owner: "geo-team",
        });
        this.flags.set("product-graph", {
            key: "product-graph",
            enabled: false,
            description: "Grafo de productos y relaciones",
            owner: "catalog-team",
        });
        this.flags.set("multitenant", {
            key: "multitenant",
            enabled: false,
            description: "Soporte multi-país",
            owner: "infra-team",
        });
    }

    isEnabled(key: string): boolean {
        const flag = this.flags.get(key);
        if (!flag) return false;
        if (!flag.enabled) return false;

        if (flag.dependencies) {
            for (const dep of flag.dependencies) {
                if (!this.isEnabled(dep)) return false;
            }
        }

        return true;
    }

    enable(key: string): void {
        const flag = this.flags.get(key);
        if (flag) flag.enabled = true;
    }

    disable(key: string): void {
        const flag = this.flags.get(key);
        if (flag) flag.enabled = false;
    }

    getAll(): FeatureFlag[] {
        return Array.from(this.flags.values());
    }

    getEnabled(): FeatureFlag[] {
        return this.getAll().filter(f => this.isEnabled(f.key));
    }

    register(flag: FeatureFlag): void {
        this.flags.set(flag.key, flag);
    }
}

export const featureFlags = new FeatureFlags();
