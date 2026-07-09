export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface GeoLocation {
    lat: number;
    lng: number;
    address: string;
    city: string;
    department: string;
}

export interface GeoAddress {
    street: string;
    city: string;
    department: string;
    country: string;
    zipCode?: string;
}

export interface DistanceResult {
    meters: number;
    kilometers: number;
    durationMinutes: number;
    transportMode: "walking" | "driving" | "transit";
}

export interface CostAnalysis {
    productPrice: number;
    transportCost: number;
    deliveryCost: number;
    totalCost: number;
    savings: number;
    recommendation: string;
}
