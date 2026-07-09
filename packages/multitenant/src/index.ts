export type Currency = "COP" | "USD" | "MXN" | "ARS" | "CLP" | "PEN";

export interface Tenant {
    id: string;
    country: string;
    currency: Currency;
    locale: string;
    timezone: string;
    domain: string;
    active: boolean;
    config: {
        stores: string[];
        maxDistanceKm: number;
        features: string[];
    };
}

const exchangeRates: Record<Currency, Record<Currency, number>> = {
    COP: { COP: 1, USD: 0.00024, MXN: 0.0048, ARS: 0.080, CLP: 0.21, PEN: 0.00091 },
    USD: { COP: 4200, USD: 1, MXN: 20.0, ARS: 330, CLP: 880, PEN: 3.80 },
    MXN: { COP: 208, USD: 0.050, MXN: 1, ARS: 16.5, CLP: 44, PEN: 0.19 },
    ARS: { COP: 12.5, USD: 0.0030, MXN: 0.061, ARS: 1, CLP: 2.67, PEN: 0.012 },
    CLP: { COP: 4.76, USD: 0.0011, MXN: 0.023, ARS: 0.37, CLP: 1, PEN: 0.0043 },
    PEN: { COP: 1100, USD: 0.26, MXN: 5.26, ARS: 85, CLP: 230, PEN: 1 },
};

export class MultitenantManager {
    private tenants = new Map<string, Tenant>();

    registerTenant(tenant: Tenant): void {
        this.tenants.set(tenant.id, tenant);
    }

    getTenant(id: string): Tenant | undefined {
        return this.tenants.get(id);
    }

    getTenantByDomain(domain: string): Tenant | undefined {
        return Array.from(this.tenants.values()).find(t => t.domain === domain);
    }

    convertCurrency(amount: number, from: Currency, to: Currency): number {
        const rate = exchangeRates[from]?.[to];
        if (!rate) throw new Error(`No exchange rate for ${from} -> ${to}`);
        return Math.round(amount * rate * 100) / 100;
    }

    formatPrice(amount: number, currency: Currency, locale: string): string {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    }

    getAllTenants(): Tenant[] {
        return Array.from(this.tenants.values());
    }

    getActiveTenants(): Tenant[] {
        return this.getAllTenants().filter(t => t.active);
    }

    registerDefault(): void {
        this.registerTenant({
            id: "co",
            country: "Colombia",
            currency: "COP",
            locale: "es-CO",
            timezone: "America/Bogota",
            domain: "ahorroya.com.co",
            active: true,
            config: {
                stores: ["exito", "jumbo", "olimpica", "ara", "d1", "cruz-verde", "farmatodo", "carulla"],
                maxDistanceKm: 20,
                features: ["search", "offers", "shopping-list", "route-optimizer"],
            },
        });

        this.registerTenant({
            id: "mx",
            country: "México",
            currency: "MXN",
            locale: "es-MX",
            timezone: "America/Mexico_City",
            domain: "ahorroya.com.mx",
            active: false,
            config: {
                stores: ["walmart", "soriana", "chedraui", "oxxo"],
                maxDistanceKm: 15,
                features: ["search"],
            },
        });
    }
}

export const multitenantManager = new MultitenantManager();
