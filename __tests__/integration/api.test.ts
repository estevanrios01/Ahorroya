const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "1" ? describe : describe.skip;
const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

jest.setTimeout(30000);

describeIntegration("API Integration", () => {
    it("products endpoint returns data", async () => {
        const res = await fetch(`${baseUrl}/api/products?q=arroz`);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
    });

    it("search endpoint returns results", async () => {
        const res = await fetch(`${baseUrl}/api/search?q=arroz`);
        const json = await res.json();
        expect(json.results).toBeDefined();
        expect(json.results.length).toBeGreaterThan(0);
    });

    it("stores endpoint returns stores", async () => {
        const res = await fetch(`${baseUrl}/api/stores`);
        const json = await res.json();
        expect(json.data.length).toBeGreaterThan(0);
    });

    it("product detail endpoint returns details", async () => {
        const res = await fetch(`${baseUrl}/api/products/arroz-diana-500g-12002073`);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.barcode).toBe("7702511000014");
        expect(json.data.prices.length).toBeGreaterThan(0);
    });
});
