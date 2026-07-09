export interface MatchCandidate {
    id: string;
    name: string;
    score: number;
}

export function fuzzyMatch(query: string, candidates: Array<{ id: string; name: string }>): MatchCandidate[] {
    const normalizedQuery = query.toLowerCase().trim();
    const queryTokens = normalizedQuery.split(/\s+/);

    return candidates
        .map((candidate) => {
            const normalizedName = candidate.name.toLowerCase().trim();
            const nameTokens = normalizedName.split(/\s+/);
            const matches = queryTokens.filter((t) => nameTokens.some((nt) => nt.includes(t) || t.includes(nt)));
            const score = matches.length / Math.max(queryTokens.length, nameTokens.length);
            return { id: candidate.id, name: candidate.name, score };
        })
        .filter((c) => c.score > 0.3)
        .sort((a, b) => b.score - a.score);
}

export function exactMatch(query: string, candidates: Array<{ id: string; name: string }>): MatchCandidate[] {
    const q = query.toLowerCase().trim();
    return candidates
        .filter((c) => c.name.toLowerCase().trim() === q)
        .map((c) => ({ id: c.id, name: c.name, score: 1 }));
}
