export interface DuplicateGroup {
    id: string;
    field: string;
    value: string;
    ids: string[];
    count: number;
}

const groups = new Map<string, DuplicateGroup>();

export function detectDuplicates(records: Array<{ id: string; [key: string]: unknown }>, field: string): DuplicateGroup[] {
    const seen = new Map<string, string[]>();

    for (const record of records) {
        const value = String(record[field] ?? "").toLowerCase().trim();
        if (!value) continue;

        const existing = seen.get(value) || [];
        existing.push(record.id);
        seen.set(value, existing);
    }

    const result: DuplicateGroup[] = [];
    let groupId = 0;

    for (const [value, ids] of seen) {
        if (ids.length > 1) {
            groupId++;
            result.push({
                id: `dup-${groupId}`,
                field,
                value,
                ids,
                count: ids.length
            });
        }
    }

    return result;
}

export function getDuplicateStats(): { total: number; groups: number } {
    return {
        total: groups.size,
        groups: groups.size
    };
}
