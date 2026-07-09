import { validateProduct } from "../../packages/ingestion/validate";
import { fingerprint } from "../../packages/ingestion/fingerprint";

describe("Ingestion Pipeline", () => {
    it("validates valid products", () => {
        expect(validateProduct({
            store: "Éxito",
            externalId: "001",
            url: "https://exito.com",
            name: "Arroz Diana",
            price: BigInt(4200),
            available: true,
            capturedAt: new Date()
        })).toBe(true);
    });

    it("rejects products with empty name", () => {
        expect(validateProduct({
            store: "Éxito",
            externalId: "001",
            url: "https://exito.com",
            name: "  ",
            price: BigInt(4200),
            available: true,
            capturedAt: new Date()
        })).toBe(false);
    });

    it("generates consistent fingerprints", () => {
        const fp1 = fingerprint("Arroz Diana Premium");
        const fp2 = fingerprint("Arroz Diana Premium");
        expect(fp1).toBe(fp2);
    });
});
