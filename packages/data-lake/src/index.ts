export interface DataLakeRecord {
    id: string;
    table: string;
    operation: "INSERT" | "UPDATE" | "DELETE";
    payload: Record<string, unknown>;
    timestamp: Date;
    source: string;
}

export interface DataLakeSnapshot {
    table: string;
    timestamp: Date;
    rows: number;
}

export class DataLake {
    private records: DataLakeRecord[] = [];
    private schemas = new Map<string, Record<string, string>>();

    registerSchema(table: string, columns: Record<string, string>): void {
        this.schemas.set(table, columns);
    }

    ingest(record: Omit<DataLakeRecord, "id">): DataLakeRecord {
        const full: DataLakeRecord = { ...record, id: crypto.randomUUID() };
        this.records.push(full);
        return full;
    }

    queryByTimeRange(table: string, from: Date, to: Date): DataLakeRecord[] {
        return this.records.filter(
            r => r.table === table && r.timestamp >= from && r.timestamp <= to
        );
    }

    queryBySource(source: string): DataLakeRecord[] {
        return this.records.filter(r => r.source === source);
    }

    getLatestSnapshot(table: string): DataLakeRecord | null {
        const filtered = this.records
            .filter(r => r.table === table && r.operation === "INSERT")
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return filtered[0] || null;
    }

    getTableStatistics(table: string): {
        totalRecords: number;
        inserts: number;
        updates: number;
        deletes: number;
        timeRange: { from: Date | null; to: Date | null };
    } {
        const tableRecords = this.records.filter(r => r.table === table);
        const timestamps = tableRecords.map(r => r.timestamp);

        return {
            totalRecords: tableRecords.length,
            inserts: tableRecords.filter(r => r.operation === "INSERT").length,
            updates: tableRecords.filter(r => r.operation === "UPDATE").length,
            deletes: tableRecords.filter(r => r.operation === "DELETE").length,
            timeRange: {
                from: timestamps.length ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : null,
                to: timestamps.length ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : null,
            },
        };
    }

    clearTable(table: string): void {
        this.records = this.records.filter(r => r.table !== table);
    }

    exportAll(): DataLakeRecord[] {
        return [...this.records];
    }
}
