import { Coordinates, DistanceResult } from "../domain/types";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

export function haversineDistance(a: Coordinates, b: Coordinates): number {
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h =
        sinDLat * sinDLat +
        Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function calculateDistance(
    origin: Coordinates,
    destination: Coordinates,
    mode: "walking" | "driving" = "driving"
): DistanceResult {
    const km = haversineDistance(origin, destination);
    const speedKmh = mode === "walking" ? 5 : 30;
    const minutes = (km / speedKmh) * 60;

    return {
        meters: Math.round(km * 1000),
        kilometers: Math.round(km * 10) / 10,
        durationMinutes: Math.round(minutes),
        transportMode: mode
    };
}
