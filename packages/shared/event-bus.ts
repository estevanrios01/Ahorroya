type Listener =
    (payload: unknown) => void;

class EventBus {
    private listeners =
        new Map<string, Listener[]>();

    on(
        event: string,
        listener: Listener
    ) {
        const current =
            this.listeners.get(event)
            ?? [];

        current.push(listener);

        this.listeners.set(
            event,
            current
        );
    }

    emit(
        event: string,
        payload: unknown
    ) {
        const listeners =
            this.listeners.get(event)
            ?? [];

        for (
            const listener
            of listeners
        ) {
            listener(payload);
        }
    }
}

export const eventBus =
    new EventBus();
