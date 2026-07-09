export interface MonitorMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
}

const metrics: MonitorMetric[] = [];

export function recordMetric(name: string, value: number, unit = "count"): void {
    metrics.push({ name, value, unit, timestamp: new Date() });
    if (metrics.length > 10000) metrics.shift();
}

export function getMetric(name: string, minutes = 60): MonitorMetric[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return metrics.filter((m) => m.name === name && m.timestamp.getTime() > cutoff);
}

export function getSummary(): Record<string, { avg: number; max: number; min: number; count: number }> {
    const grouped: Record<string, number[]> = {};
    for (const m of metrics) {
        if (!grouped[m.name]) grouped[m.name] = [];
        grouped[m.name].push(m.value);
    }

    const summary: Record<string, { avg: number; max: number; min: number; count: number }> = {};
    for (const [name, values] of Object.entries(grouped)) {
        summary[name] = {
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            max: Math.max(...values),
            min: Math.min(...values),
            count: values.length
        };
    }
    return summary;
}
