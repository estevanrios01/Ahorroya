import { tokenize } from "../../packages/search-index/tokenizer";
import { ranking } from "../../packages/search-index/ranking";
import { SearchDocument } from "../../packages/search-index/document";

describe("Search Index", () => {
    it("tokenizes text correctly", () => {
        const tokens = tokenize("Arroz Diana Premium");
        expect(tokens).toContain("arroz");
        expect(tokens).toContain("diana");
        expect(tokens).toContain("premium");
    });

    it("removes accents during tokenization", () => {
        const tokens = tokenize("Acetaminofén");
        expect(tokens).toContain("acetaminofen");
    });

    it("ranks documents by relevance", () => {
        const docs: SearchDocument[] = [
            {
                id: "1", name: "Arroz Diana", slug: "arroz-diana",
                brand: "Diana", category: "Despensa", aliases: [],
                tokens: ["arroz", "diana"],
                stores: 5, minimumPrice: BigInt(3800), maximumPrice: BigInt(5200)
            },
            {
                id: "2", name: "Arroz Roa", slug: "arroz-roa",
                brand: "Roa", category: "Despensa", aliases: [],
                tokens: ["arroz", "roa"],
                stores: 3, minimumPrice: BigInt(3400), maximumPrice: BigInt(4800)
            }
        ];

        const results = ranking(["arroz", "diana"], docs);
        expect(results[0].document.id).toBe("1");
        expect(results[0].score).toBeGreaterThan(0);
    });
});
