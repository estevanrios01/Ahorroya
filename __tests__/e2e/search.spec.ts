describe("Search E2E", () => {
    it("user can search for a product", async () => {
        const res = await fetch("http://localhost:3000/api/products?q=arroz");
        const json = await res.json();
        expect(json.data.length).toBeGreaterThan(0);
        expect(json.data[0].name.toLowerCase()).toContain("arroz");
    });

    it("user can view product details", async () => {
        const res = await fetch("http://localhost:3000/api/products/arroz-diana-premium");
        const json = await res.json();
        expect(json.data.name).toBe("Arroz Diana Premium");
        expect(json.data.prices.length).toBeGreaterThan(0);
    });

    it("user can search by barcode", async () => {
        const res = await fetch("http://localhost:3000/api/barcode/7702010000011");
        const json = await res.json();
        expect(json.success).toBe(true);
    });
});
