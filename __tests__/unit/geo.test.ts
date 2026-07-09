import { haversineDistance, calculateDistance } from "../../services/geo-engine/application/distance";
import { analyzeTotalCost } from "../../services/geo-engine/application/cost";

describe("Geo Engine", () => {
    it("calculates haversine distance", () => {
        const cali = { latitude: 3.4516, longitude: -76.5320 };
        const same = { latitude: 3.4516, longitude: -76.5320 };
        expect(haversineDistance(cali, same)).toBe(0);
    });

    it("calculates distance between two points", () => {
        const a = { latitude: 3.4516, longitude: -76.5320 };
        const b = { latitude: 3.4700, longitude: -76.5400 };
        const result = calculateDistance(a, b, "driving");
        expect(result.meters).toBeGreaterThan(0);
        expect(result.kilometers).toBeGreaterThan(0);
    });

    it("analyzes total cost including transport", () => {
        const result = analyzeTotalCost(
            { latitude: 3.45, longitude: -76.53 },
            { latitude: 3.47, longitude: -76.54 },
            5000
        );
        expect(result.productPrice).toBe(5000);
        expect(result.transportCost).toBeGreaterThan(0);
        expect(result.totalCost).toBeGreaterThan(5000);
    });
});
