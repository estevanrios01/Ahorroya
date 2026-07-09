export interface GraphNode {
    id: string;
    type: "product" | "brand" | "category" | "store" | "price";
    label: string;
    properties: Record<string, unknown>;
}

export interface GraphEdge {
    from: string;
    to: string;
    type: string;
    weight: number;
}

export class ProductGraph {
    private nodes = new Map<string, GraphNode>();
    private edges: GraphEdge[] = [];

    addNode(node: GraphNode): void {
        this.nodes.set(node.id, node);
    }

    addEdge(edge: GraphEdge): void {
        this.edges.push(edge);
    }

    getNode(id: string): GraphNode | undefined {
        return this.nodes.get(id);
    }

    getConnections(nodeId: string): Array<{ node: GraphNode; edge: GraphEdge }> {
        const connections: Array<{ node: GraphNode; edge: GraphEdge }> = [];

        for (const edge of this.edges) {
            if (edge.from === nodeId) {
                const node = this.nodes.get(edge.to);
                if (node) connections.push({ node, edge });
            }
            if (edge.to === nodeId) {
                const node = this.nodes.get(edge.from);
                if (node) connections.push({ node, edge });
            }
        }

        return connections;
    }

    findPath(from: string, to: string): GraphNode[] {
        const visited = new Set<string>();
        const queue: Array<{ nodeId: string; path: GraphNode[] }> = [
            { nodeId: from, path: [this.nodes.get(from)!] },
        ];

        while (queue.length > 0) {
            const { nodeId, path } = queue.shift()!;

            if (nodeId === to) return path;

            if (visited.has(nodeId)) continue;
            visited.add(nodeId);

            for (const edge of this.edges) {
                let nextId: string | null = null;

                if (edge.from === nodeId) nextId = edge.to;
                if (edge.to === nodeId) nextId = edge.from;

                if (nextId && !visited.has(nextId)) {
                    const nextNode = this.nodes.get(nextId);
                    if (nextNode) {
                        queue.push({ nodeId: nextId, path: [...path, nextNode] });
                    }
                }
            }
        }

        return [];
    }

    getSubgraph(nodeId: string, depth = 2): GraphNode[] {
        const result: GraphNode[] = [];
        const visited = new Set<string>();
        const queue: Array<{ id: string; d: number }> = [{ id: nodeId, d: 0 }];

        while (queue.length > 0) {
            const { id, d } = queue.shift()!;
            if (visited.has(id) || d > depth) continue;
            visited.add(id);

            const node = this.nodes.get(id);
            if (node) result.push(node);

            for (const edge of this.edges) {
                if (edge.from === id && !visited.has(edge.to)) {
                    queue.push({ id: edge.to, d: d + 1 });
                }
                if (edge.to === id && !visited.has(edge.from)) {
                    queue.push({ id: edge.from, d: d + 1 });
                }
            }
        }

        return result;
    }

    getStatistics(): { nodes: number; edges: number; byType: Record<string, number> } {
        const byType: Record<string, number> = {};
        for (const node of this.nodes.values()) {
            byType[node.type] = (byType[node.type] || 0) + 1;
        }
        return { nodes: this.nodes.size, edges: this.edges.length, byType };
    }
}
