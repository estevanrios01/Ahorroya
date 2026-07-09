export interface AuditEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    userId?: string;
    before?: unknown;
    after?: unknown;
    timestamp: Date;
}

const auditLog: AuditEntry[] = [];

export function recordAudit(entry: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
    const full: AuditEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date()
    };
    auditLog.push(full);
    return full;
}

export function getAuditHistory(entity?: string, limit = 100): AuditEntry[] {
    let entries = auditLog;
    if (entity) {
        entries = entries.filter((e) => e.entity === entity);
    }
    return entries.slice(-limit).reverse();
}

export function getAuditStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const entry of auditLog) {
        stats[entry.action] = (stats[entry.action] || 0) + 1;
    }
    return stats;
}
