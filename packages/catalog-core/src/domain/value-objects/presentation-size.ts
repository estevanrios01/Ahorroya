export type SizeUnit = "ml" | "l" | "g" | "kg" | "mg" | "unidad" | "tableta" | "cápsula" | "sobre" | "bolsa";

export class PresentationSize {
    constructor(
        public readonly quantity: number,
        public readonly unit: SizeUnit
    ) {
        if (quantity <= 0) throw new Error("Quantity must be positive");
    }

    toBaseUnit(): number {
        const conversions: Record<SizeUnit, number> = {
            "ml": 1, "l": 1000,
            "g": 1, "kg": 1000, "mg": 0.001,
            "unidad": 1, "tableta": 1, "cápsula": 1, "sobre": 1, "bolsa": 1
        };
        return this.quantity * (conversions[this.unit] || 1);
    }

    isComparable(other: PresentationSize): boolean {
        const liquid = ["ml", "l"];
        const solid = ["g", "kg", "mg"];
        const unit = ["unidad", "tableta", "cápsula", "sobre", "bolsa"];

        const category = (u: SizeUnit) =>
            liquid.includes(u) ? "liquid" : solid.includes(u) ? "solid" : "unit";

        return category(this.unit) === category(other.unit);
    }

    format(): string {
        return `${this.quantity} ${this.unit}`;
    }
}
