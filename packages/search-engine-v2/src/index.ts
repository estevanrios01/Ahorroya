export interface SearchDocumentV2 {
    id: string;
    name: string;
    normalizedName: string;
    brand: string;
    category: string;
    barcode?: string;
    tokens: string[];
    searchScore: number;
    qualityScore: number;
    popularityScore: number;
    freshnessScore: number;
    geoScore: number;
    promotionScore: number;
    inventoryScore: number;
    priceScore: number;
    finalScore: number;
}

const spanishStopWords = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas",
    "y", "e", "o", "u", "a", "ante", "bajo", "cabe", "con",
    "contra", "de", "desde", "en", "entre", "hacia", "hasta",
    "para", "por", "según", "sin", "sobre", "tras",
    "del", "al", "lo", "le", "su", "sus", "tu", "mis",
]);

export class SearchEngineV2 {
    private documents: Map<string, SearchDocumentV2> = new Map();

    index(doc: SearchDocumentV2): void {
        this.documents.set(doc.id, doc);
    }

    indexMany(docs: SearchDocumentV2[]): void {
        for (const doc of docs) {
            this.documents.set(doc.id, doc);
        }
    }

    private tokenize(text: string): string[] {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter(t => t.length > 1 && !spanishStopWords.has(t));
    }

    private synonyms(word: string): string[] {
        const map: Record<string, string[]> = {
            "acetaminofen": ["paracetamol", "dolex"],
            "ibuprofeno": ["motrin", "advil"],
            "arroz": ["arroz"],
            "leche": ["leche", "lacteo", "lacteos"],
            "pan": ["pan", "panaderia"],
            "aceite": ["aceite", "aceites", "oleico"],
            "jabon": ["jabon", "jabones", "aseo"],
        };
        return map[word] || [word];
    }

    private stem(word: string): string {
        if (word.endsWith("ción")) return word.slice(0, -4) + "ción";
        if (word.endsWith("s")) return word.slice(0, -1);
        if (word.endsWith("es")) return word.slice(0, -2);
        if (word.endsWith("ando")) return word.slice(0, -4);
        if (word.endsWith("endo")) return word.slice(0, -4);
        return word;
    }

    private fuzzyMatch(token: string, target: string): number {
        if (target.includes(token)) return 1;
        const dist = this.levenshtein(token, target);
        const maxLen = Math.max(token.length, target.length);
        return maxLen > 0 ? Math.max(0, 1 - dist / maxLen) : 0;
    }

    private levenshtein(a: string, b: string): number {
        const m = a.length, n = b.length;
        const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                dp[i][j] = a[i - 1] === b[j - 1]
                    ? dp[i - 1][j - 1]
                    : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
        return dp[m][n];
    }

    search(query: string): SearchDocumentV2[] {
        const tokens = this.tokenize(query);
        const expandedTokens = tokens.flatMap(t => this.synonyms(t));
        const stemmedTokens = expandedTokens.map(t => this.stem(t));
        const uniqueTokens = [...new Set(stemmedTokens)];

        const results: Array<{ doc: SearchDocumentV2; score: number }> = [];

        for (const doc of this.documents.values()) {
            let score = 0;

            for (const token of uniqueTokens) {
                const exact = doc.tokens.some(t => t.includes(token));
                const fuzzy = doc.tokens.reduce((max, t) => Math.max(max, this.fuzzyMatch(token, t)), 0);

                if (exact) score += 1;
                if (fuzzy > 0.6) score += fuzzy * 0.5;
                if (doc.barcode && doc.barcode.includes(token)) score += 2;
                if (doc.brand.toLowerCase().includes(token)) score += 0.5;
            }

            if (score > 0) {
                score += doc.popularityScore * 0.1;
                score += doc.promotionScore * 0.15;
                score += doc.geoScore * 0.05;
                score += doc.freshnessScore * 0.1;

                results.push({
                    doc,
                    score: Math.round(score * 100) / 100,
                });
            }
        }

        return results
            .sort((a, b) => b.score - a.score)
            .map(r => ({
                ...r.doc,
                finalScore: r.score,
            }));
    }

    clear(): void {
        this.documents.clear();
    }

    count(): number {
        return this.documents.size;
    }
}
