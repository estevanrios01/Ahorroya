export class Slug {
    private constructor(public readonly value: string) {
        if (!value) throw new Error("Slug cannot be empty");
    }

    static fromName(name: string): Slug {
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
        return new Slug(slug);
    }

    static fromString(value: string): Slug {
        return new Slug(value);
    }

    equals(other: Slug): boolean { return this.value === other.value; }
}
