import {
    CurrentPriceCalculator,
    HistoricalMinimumCalculator,
    HistoricalMaximumCalculator,
    RollingAverageCalculator,
    MedianCalculator,
    PercentileCalculator,
    TrendCalculator,
    PriceIndexCalculator,
} from "../calculators";

export interface PriceStatistics {
    current: number | null;
    min: number | null;
    max: number | null;
    avg7d: number | null;
    avg30d: number | null;
    median: number | null;
    p25: number | null;
    p75: number | null;
    trend: "up" | "down" | "stable";
    index: number;
    volatility: number;
    sampleSize: number;
}

export class StatisticsService {
    private currentCalc = new CurrentPriceCalculator();
    private minCalc = new HistoricalMinimumCalculator();
    private maxCalc = new HistoricalMaximumCalculator();
    private avg7dCalc = new RollingAverageCalculator();
    private avg30dCalc = new RollingAverageCalculator();
    private medianCalc = new MedianCalculator();
    private p25Calc = new PercentileCalculator();
    private p75Calc = new PercentileCalculator();
    private trendCalc = new TrendCalculator();
    private indexCalc = new PriceIndexCalculator();

    calculate(events: number[]): PriceStatistics {
        const avg7d = this.avg7dCalc.calculate(events, 7);
        const avg30d = this.avg30dCalc.calculate(events, 30);
        const avg = avg30d || avg7d || events[events.length - 1] || 0;

        return {
            current: this.currentCalc.calculate(events),
            min: this.minCalc.calculate(events),
            max: this.maxCalc.calculate(events),
            avg7d,
            avg30d,
            median: this.medianCalc.calculate(events),
            p25: this.p25Calc.calculate(events, 25),
            p75: this.p75Calc.calculate(events, 75),
            trend: this.trendCalc.calculate(events),
            index: this.indexCalc.calculate(events[events.length - 1] || 0, avg),
            volatility: this.calculateVolatility(events),
            sampleSize: events.length,
        };
    }

    private calculateVolatility(events: number[]): number {
        if (events.length < 2) return 0;
        const mean = events.reduce((a, b) => a + b, 0) / events.length;
        const variance = events.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / events.length;
        return Math.round(Math.sqrt(variance));
    }
}
