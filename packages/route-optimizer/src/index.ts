export interface RoutePoint {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

export interface OptimizedRoute {
    points: RoutePoint[];
    totalDistanceKm: number;
    totalDurationMin: number;
    totalCost: number;
    order: string[];
    savings: number;
}

export class RouteOptimizer {
    private haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
        const R = 6371;
        const dLat = ((b.lat - a.lat) * Math.PI) / 180;
        const dLng = ((b.lng - a.lng) * Math.PI) / 180;
        const lat1 = (a.lat * Math.PI) / 180;
        const lat2 = (b.lat * Math.PI) / 180;

        const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

        return 2 * R * Math.asin(Math.sqrt(h));
    }

    nearestNeighbor(
        origin: { lat: number; lng: number },
        points: RoutePoint[]
    ): OptimizedRoute {
        if (points.length === 0) {
            return {
                points: [],
                totalDistanceKm: 0,
                totalDurationMin: 0,
                totalCost: 0,
                order: [],
                savings: 0,
            };
        }

        const unvisited = [...points];
        const order: string[] = [];
        let current = { lat: origin.lat, lng: origin.lng };
        let totalDistance = 0;

        while (unvisited.length > 0) {
            let nearestIdx = 0;
            let nearestDist = Infinity;

            for (let i = 0; i < unvisited.length; i++) {
                const dist = this.haversine(current, {
                    lat: unvisited[i].latitude,
                    lng: unvisited[i].longitude,
                });
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIdx = i;
                }
            }

            totalDistance += nearestDist;
            current = {
                lat: unvisited[nearestIdx].latitude,
                lng: unvisited[nearestIdx].longitude,
            };
            order.push(unvisited[nearestIdx].name);
            unvisited.splice(nearestIdx, 1);
        }

        const totalDurationMin = Math.round((totalDistance / 30) * 60);
        const transportCostPerKm = 2000;
        const totalCost = Math.round(totalDistance * transportCostPerKm);

        return {
            points,
            totalDistanceKm: Math.round(totalDistance * 10) / 10,
            totalDurationMin,
            totalCost,
            order,
            savings: 0,
        };
    }
}
