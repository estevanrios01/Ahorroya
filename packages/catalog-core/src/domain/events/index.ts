export interface DomainEvent {
    eventName: string;
    aggregateId: string;
    occurredOn: Date;
    payload: Record<string, unknown>;
}

export class MasterProductCreated implements DomainEvent {
    readonly eventName = "MasterProductCreated";
    readonly occurredOn = new Date();
    constructor(
        public readonly aggregateId: string,
        public readonly payload: Record<string, unknown>
    ) {}
}

export class MasterProductMerged implements DomainEvent {
    readonly eventName = "MasterProductMerged";
    readonly occurredOn = new Date();
    constructor(
        public readonly aggregateId: string,
        public readonly payload: Record<string, unknown>
    ) {}
}

export class StoreProductLinked implements DomainEvent {
    readonly eventName = "StoreProductLinked";
    readonly occurredOn = new Date();
    constructor(
        public readonly aggregateId: string,
        public readonly payload: Record<string, unknown>
    ) {}
}

export class PriceUpdated implements DomainEvent {
    readonly eventName = "PriceUpdated";
    readonly occurredOn = new Date();
    constructor(
        public readonly aggregateId: string,
        public readonly payload: Record<string, unknown>
    ) {}
}

export class PromotionDetected implements DomainEvent {
    readonly eventName = "PromotionDetected";
    readonly occurredOn = new Date();
    constructor(
        public readonly aggregateId: string,
        public readonly payload: Record<string, unknown>
    ) {}
}

export class DuplicateDetected implements DomainEvent {
    readonly eventName = "DuplicateDetected";
    readonly occurredOn = new Date();
    constructor(
        public readonly aggregateId: string,
        public readonly payload: Record<string, unknown>
    ) {}
}

export class ProductVerified implements DomainEvent {
    readonly eventName = "ProductVerified";
    readonly occurredOn = new Date();
    constructor(
        public readonly aggregateId: string,
        public readonly payload: Record<string, unknown>
    ) {}
}
