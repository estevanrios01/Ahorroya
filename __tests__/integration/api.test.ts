describe("API Integration", () => {
    it("products endpoint returns data", async () => {
        const res = await fetch("http://localhost:3000/api/products");
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
    });

    it("search endpoint returns results", async () => {
        const res = await fetch("http://localhost:3000/api/search?q=arroz");
        const json = await res.json();
        expect(json.results).toBeDefined();
    });

    it("stores endpoint returns stores", async () => {
        const res = await fetch("http://localhost:3000/api/stores");
        const json = await res.json();
        expect(json.data.length).toBeGreaterThan(0);
    });

    it("product detail endpoint returns details", async () => {
        const res = await fetch("http://localhost:3000/api/products/arroz-diana-premium");
        const json = await res.json();
        expect(json.success).toBe(true);
    });
});
