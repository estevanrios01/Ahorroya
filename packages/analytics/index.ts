export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, unknown>;
    timestamp: Date;
}

const events: AnalyticsEvent[] = [];

export function track(event: string, properties?: Record<string, unknown>): void {
    const entry: AnalyticsEvent = {
        name: event,
        properties,
        timestamp: new Date()
    };
    events.push(entry);
    if (events.length > 100000) events.shift();
}

export function getEvents(name?: string, minutes = 60): AnalyticsEvent[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    let filtered = events.filter((e) => e.timestamp.getTime() > cutoff);
    if (name) filtered = filtered.filter((e) => e.name === name);
    return filtered;
}

export function count(name: string, minutes = 60): number {
    return getEvents(name, minutes).length;
}

export interface AnalyticsReport {
    event: string;
    count: number;
    lastHour: number;
    lastDay: number;
}

export function generateReport(): AnalyticsReport[] {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const grouped = new Map<string, { total: number; hour: number; day: number }>();

    for (const event of events) {
        const ts = event.timestamp.getTime();
        const current = grouped.get(event.name) || { total: 0, hour: 0, day: 0 };
        current.total++;
        if (ts > hourAgo) current.hour++;
        if (ts > dayAgo) current.day++;
        grouped.set(event.name, current);
    }

    return Array.from(grouped.entries()).map(([event, stats]) => ({
        event,
        count: stats.total,
        lastHour: stats.hour,
        lastDay: stats.day
    }));
}
