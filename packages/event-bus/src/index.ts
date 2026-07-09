export interface EventEnvelope {
    id: string;
    name: string;
    version: number;
    payload: Record<string, unknown>;
    metadata: {
    producer: string;
    timestamp: Date;
    correlationId?: string;
    };
}

export type EventHandler = (event: EventEnvelope) => Promise<void>;

export class EventBus {
    private subscribers = new Map<string, EventHandler[]>();
    private deadLetterQueue: EventEnvelope[] = [];
    private eventStore: EventEnvelope[] = [];

    subscribe(eventName: string, handler: EventHandler): void {
        const handlers = this.subscribers.get(eventName) || [];
        handlers.push(handler);
        this.subscribers.set(eventName, handlers);
    }

    async publish(event: Omit<EventEnvelope, "id">): Promise<void> {
        const envelope: EventEnvelope = {
            ...event,
            id: crypto.randomUUID(),
        };

        this.eventStore.push(envelope);
        if (this.eventStore.length > 100000) this.eventStore.shift();

        const handlers = this.subscribers.get(event.name) || [];

        for (const handler of handlers) {
            try {
                await handler(envelope);
            } catch (error) {
                this.deadLetterQueue.push(envelope);
                console.error(`EventBus: Handler failed for ${event.name}`, error);
            }
        }
    }

    async replay(eventName?: string): Promise<void> {
        const events = eventName
            ? this.eventStore.filter(e => e.name === eventName)
            : this.eventStore;

        for (const event of events) {
            const handlers = this.subscribers.get(event.name) || [];
            for (const handler of handlers) {
                try {
                    await handler(event);
                } catch (error) {
                    this.deadLetterQueue.push(event);
                }
            }
        }
    }

    getDeadLetterQueue(): EventEnvelope[] {
        return this.deadLetterQueue;
    }

    retryDeadLetters(): void {
        const letters = [...this.deadLetterQueue];
        this.deadLetterQueue = [];
        letters.forEach(e => this.publish(e));
    }

    getEventStore(): EventEnvelope[] {
        return this.eventStore;
    }
}

export const eventBus = new EventBus();
