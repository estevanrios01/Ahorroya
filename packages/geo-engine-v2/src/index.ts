export interface GeoLocation {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    department?: string;
}

export interface GeoStore {
    id: string;
    name: string;
    location: GeoLocation;
    branches: GeoLocation[];
}

export interface Isochrone {
    center: GeoLocation;
    radiusKm: number;
    estimatedMinutes: number;
    reachable: boolean;
}

export interface TrafficInfo {
    currentSpeedKmh: number;
    congestionFactor: number;
    estimatedDelayMin: number;
    isRushHour: boolean;
}

export class GeoEngineV2 {
    private stores: GeoStore[] = [];

    registerStore(store: GeoStore): void {
        this.stores.push(store);
    }

    private haversine(a: GeoLocation, b: GeoLocation): number {
        const R = 6371;
        const dLat = ((b.lat - a.lat) * Math.PI) / 180;
        const dLng = ((b.lng - a.lng) * Math.PI) / 180;
        const lat1 = (a.lat * Math.PI) / 180;
        const lat2 = (b.lat * Math.PI) / 180;
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(h));
    }

    findNearby(userLocation: GeoLocation, radiusKm: number): GeoStore[] {
        return this.stores.filter(store => {
            const dist = this.haversine(userLocation, store.location);
            return dist <= radiusKm;
        }).sort((a, b) =>
            this.haversine(userLocation, a.location) - this.haversine(userLocation, b.location)
        );
    }

    calculateIsochrone(origin: GeoLocation, minutes: number): Isochrone {
        const avgSpeedKmh = 30;
        const radiusKm = (avgSpeedKmh / 60) * minutes;

        return {
            center: origin,
            radiusKm: Math.round(radiusKm * 10) / 10,
            estimatedMinutes: minutes,
            reachable: radiusKm > 1,
        };
    }

    getTrafficInfo(location: GeoLocation): TrafficInfo {
        const now = new Date();
        const hour = now.getHours();
        const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

        return {
            currentSpeedKmh: isRushHour ? 20 : 40,
            congestionFactor: isRushHour ? 2.0 : 1.0,
            estimatedDelayMin: isRushHour ? 15 : 0,
            isRushHour,
        };
    }

    getCityCoverage(): Record<string, number> {
        const coverage: Record<string, number> = {};
        for (const store of this.stores) {
            const city = store.location.city || "Unknown";
            coverage[city] = (coverage[city] || 0) + 1 + store.branches.length;
        }
        return coverage;
    }

    clear(): void {
        this.stores = [];
    }
}
