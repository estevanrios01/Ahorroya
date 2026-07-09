export class ProductName {
    private constructor(private readonly value: string) {
        if (!value || value.trim().length < 2) {
            throw new Error("Product name must be at least 2 characters");
        }
    }

    static create(raw: string): ProductName {
        const normalized = raw
            .trim()
            .replace(/\s+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        return new ProductName(normalized);
    }

    static createFromCanonical(raw: string): ProductName {
        return new ProductName(raw);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: ProductName): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }

    contains(term: string): boolean {
        return this.value.toLowerCase().includes(term.toLowerCase());
    }

    similarity(other: ProductName): number {
        const a = this.value.toLowerCase().split(/\s+/);
        const b = other.value.toLowerCase().split(/\s+/);
        const intersection = a.filter((t) => b.includes(t)).length;
        const union = new Set([...a, ...b]).size;
        return union > 0 ? intersection / union : 0;
    }
}
