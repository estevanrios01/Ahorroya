export class Money {
    private constructor(
        public readonly amount: number,
        public readonly currency: string = "COP"
    ) {
        if (amount < 0) throw new Error("Amount cannot be negative");
    }

    static fromRaw(value: number | string): Money {
        const amount = typeof value === "string"
            ? parseFloat(value.replace(/[^0-9.,]/g, "").replace(",", "."))
            : value;
        return new Money(Math.round(amount * 100) / 100);
    }

    add(other: Money): Money {
        return new Money(this.amount + other.amount, this.currency);
    }

    subtract(other: Money): Money {
        return new Money(this.amount - other.amount, this.currency);
    }

    multiply(factor: number): Money {
        return new Money(Math.round(this.amount * factor * 100) / 100, this.currency);
    }

    isGreaterThan(other: Money): boolean { return this.amount > other.amount; }
    isLessThan(other: Money): boolean { return this.amount < other.amount; }
    equals(other: Money): boolean { return this.amount === other.amount && this.currency === other.currency; }

    format(): string {
        return `$${this.amount.toLocaleString("es-CO")}`;
    }

    toJSON(): { amount: number; currency: string } {
        return { amount: this.amount, currency: this.currency };
    }
}
