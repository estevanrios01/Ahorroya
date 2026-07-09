export class CurrentPriceCalculator {
    calculate(events: number[]): number | null {
        return events.length > 0 ? events[events.length - 1] : null;
    }
}

export class HistoricalMinimumCalculator {
    calculate(events: number[]): number | null {
        return events.length > 0 ? Math.min(...events) : null;
    }
}

export class HistoricalMaximumCalculator {
    calculate(events: number[]): number | null {
        return events.length > 0 ? Math.max(...events) : null;
    }
}

export class RollingAverageCalculator {
    calculate(events: number[], window = 7): number | null {
        if (events.length === 0) return null;
        const slice = events.slice(-window);
        return Math.round((slice.reduce((a, b) => a + b, 0) / slice.length) * 100) / 100;
    }
}

export class MedianCalculator {
    calculate(events: number[]): number | null {
        if (events.length === 0) return null;
        const sorted = [...events].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
}

export class PercentileCalculator {
    calculate(events: number[], percentile: number): number | null {
        if (events.length === 0) return null;
        const sorted = [...events].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
}

export class TrendCalculator {
    calculate(events: number[]): "up" | "down" | "stable" {
        if (events.length < 3) return "stable";
        const recent = events.slice(-3);
        const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const first = events[events.length - 3];
        if (avg > first * 1.02) return "up";
        if (avg < first * 0.98) return "down";
        return "stable";
    }
}

export class PriceIndexCalculator {
    calculate(current: number, historicalAverage: number): number {
        if (historicalAverage === 0) return 100;
        return Math.round((current / historicalAverage) * 100);
    }
}
