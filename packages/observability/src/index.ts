export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    service: string;
    message: string;
    metadata?: Record<string, unknown>;
}

export interface MetricPoint {
    name: string;
    value: number;
    tags: Record<string, string>;
    timestamp: Date;
}

export interface Span {
    id: string;
    traceId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: Date;
    endTime?: Date;
    durationMs?: number;
    status: "OK" | "ERROR";
    tags: Record<string, string>;
}

export class Observability {
    private logs: LogEntry[] = [];
    private metrics: MetricPoint[] = [];
    private traces: Map<string, Span[]> = new Map();

    log(level: LogLevel, service: string, message: string, metadata?: Record<string, unknown>): LogEntry {
        const entry: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            level,
            service,
            message,
            metadata,
        };
        this.logs.push(entry);
        if (this.logs.length > 10000) this.logs.shift();

        if (level === "error") {
            console.error(`[${service}] ${message}`, metadata || "");
        }

        return entry;
    }

    recordMetric(name: string, value: number, tags?: Record<string, string>): MetricPoint {
        const point: MetricPoint = {
            name,
            value,
            tags: tags || {},
            timestamp: new Date(),
        };
        this.metrics.push(point);
        if (this.metrics.length > 50000) this.metrics.shift();
        return point;
    }

    startSpan(traceId: string, operationName: string, tags?: Record<string, string>): Span {
        const span: Span = {
            id: crypto.randomUUID(),
            traceId,
            operationName,
            startTime: new Date(),
            status: "OK",
            tags: tags || {},
        };

        const trace = this.traces.get(traceId) || [];
        trace.push(span);
        this.traces.set(traceId, trace);

        return span;
    }

    endSpan(span: Span, status: "OK" | "ERROR" = "OK"): void {
        span.endTime = new Date();
        span.durationMs = span.endTime.getTime() - span.startTime.getTime();
        span.status = status;
    }

    getLogs(level?: LogLevel, service?: string, from?: Date, to?: Date): LogEntry[] {
        let filtered = this.logs;
        if (level) filtered = filtered.filter(l => l.level === level);
        if (service) filtered = filtered.filter(l => l.service === service);
        if (from) filtered = filtered.filter(l => l.timestamp >= from);
        if (to) filtered = filtered.filter(l => l.timestamp <= to);
        return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 1000);
    }

    getTrace(traceId: string): Span[] {
        return this.traces.get(traceId) || [];
    }

    getMetricsSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
        const summary: Record<string, { values: number[] }> = {};

        for (const point of this.metrics) {
            if (!summary[point.name]) summary[point.name] = { values: [] };
            summary[point.name].values.push(point.value);
        }

        const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
        for (const [name, data] of Object.entries(summary)) {
            const vals = data.values;
            result[name] = {
                avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100,
                min: Math.min(...vals),
                max: Math.max(...vals),
                count: vals.length,
            };
        }

        return result;
    }

    getDashboard(): {
        totalLogs: number;
        errorCount: number;
        totalMetrics: number;
        totalTraces: number;
        services: string[];
    } {
        const services = [...new Set(this.logs.map(l => l.service))];
        return {
            totalLogs: this.logs.length,
            errorCount: this.logs.filter(l => l.level === "error").length,
            totalMetrics: this.metrics.length,
            totalTraces: this.traces.size,
            services,
        };
    }
}

export const observability = new Observability();
