// Core domain types for AhorroYa

export interface GeoPoint {
    latitude: number;
    longitude: number;
}

export interface Address {
    street: string;
    city: string;
    department: string;
    country: string;
    zipCode?: string;
    coordinates?: GeoPoint;
}

export interface DateRange {
    from: Date;
    to: Date;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    pagination?: Pagination;
}

export type SourceType = "scraper" | "api" | "user" | "admin";
export type RecordStatus = "active" | "inactive" | "deleted" | "pending";
