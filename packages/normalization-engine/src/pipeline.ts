const brandAliases: Record<string, string> = {
    "c verde": "Cruz Verde",
    "cruzverde": "Cruz Verde",
    "exito": "Éxito",
    "exito.com": "Éxito",
    "olimpica": "Olímpica",
    "farmatodo sas": "Farmatodo",
    "d1": "Tiendas D1",
    "tiendas d1": "Tiendas D1",
    "makro": "Makro",
    "jumbo": "Jumbo",
};

const unitMap: Record<string, string> = {
    "ml": "ml", "mililitro": "ml", "mililitros": "ml", "mL": "ml", "ML": "ml",
    "l": "L", "lt": "L", "litro": "L", "litros": "L", "LT": "L",
    "g": "g", "gr": "g", "gramo": "g", "gramos": "g", "GR": "g",
    "kg": "kg", "kilo": "kg", "kilos": "kg", "KG": "kg",
    "mg": "mg", "miligramo": "mg", "miligramos": "mg",
};

const categoryPatterns: Record<string, string> = {
    "aspirina": "Medicamentos OTC",
    "aspirinas": "Medicamentos OTC",
    "acetaminofen": "Medicamentos OTC",
    "ibuprofeno": "Medicamentos OTC",
    "queso": "Lácteos",
    "quesos": "Lácteos",
    "leche": "Lácteos",
    "yogurt": "Lácteos",
    "atun": "Enlatados",
    "atunes": "Enlatados",
    "sardina": "Enlatados",
    "sardinas": "Enlatados",
    "frijol": "Despensa",
    "frijoles": "Despensa",
    "lenteja": "Despensa",
    "lentejas": "Despensa",
    "arroz": "Despensa",
    "aceite": "Despensa",
    "pan": "Panadería",
    "jabon": "Aseo",
    "shampoo": "Aseo",
    "detergente": "Aseo",
};

export class NormalizerPipeline {
    trim(text: string): string { return text.trim(); }

    unicode(text: string): string {
        return text.normalize("NFC");
    }

    lowerCase(text: string): string { return text.toLowerCase(); }

    removeAccents(text: string): string {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    removePunctuation(text: string): string {
        return text.replace(/[^\w\sáéíóúñ]/g, " ").replace(/\s+/g, " ").trim();
    }

    resolveUnits(text: string): string {
        let result = text;
        for (const [alias, canonical] of Object.entries(unitMap)) {
            const regex = new RegExp(`\\b${alias}\\b`, "gi");
            result = result.replace(regex, canonical);
        }
        return result;
    }

    resolveBrands(text: string): string {
        let result = this.removeAccents(text.toLowerCase());
        for (const [alias, canonical] of Object.entries(brandAliases)) {
            const regex = new RegExp(`\\b${alias}\\b`, "gi");
            result = result.replace(regex, canonical);
        }
        return text;
    }

    resolveCategories(text: string): string {
        const lower = text.toLowerCase();
        for (const [keyword, category] of Object.entries(categoryPatterns)) {
            if (lower.includes(keyword)) return category;
        }
        return text;
    }

    extractPresentation(text: string): { name: string; quantity?: number; unit?: string } {
        const patterns = [
            /(\d+)\s*(ml|l|lt|g|gr|kg|mg)\b/i,
            /x\s*(\d+)\s*(unidad(?:es)?|tableta(?:s)?|cápsula(?:s)?|sobre(?:s)?|bolsa(?:s)?)?\b/i,
            /(\d+)\s*(ml|l|kg|g)/i,
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const quantity = parseInt(match[1]);
                const unit = (match[2] || "unidad").toLowerCase();
                const resolvedUnit = unitMap[unit] || unit;
                const name = text.replace(pattern, "").trim();
                return { name, quantity, unit: resolvedUnit };
            }
        }

        return { name: text };
    }

    capitalizeName(text: string): string {
        return text
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    normalize(raw: string): string {
        let result = raw;
        result = this.trim(result);
        result = this.unicode(result);
        result = result.toLowerCase();
        result = this.removeAccents(result);
        result = this.removePunctuation(result);
        result = this.resolveUnits(result);
        result = this.capitalizeName(result.trim());
        return result;
    }

    normalizeFull(raw: string): {
        normalized: string;
        presentation: { name: string; quantity?: number; unit?: string };
        category?: string;
    } {
        const normalized = this.normalize(raw);
        const presentation = this.extractPresentation(normalized);
        const category = this.resolveCategories(normalized);
        return { normalized, presentation, category };
    }
}
