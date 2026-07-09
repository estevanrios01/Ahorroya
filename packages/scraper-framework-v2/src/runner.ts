import { PluginRegistry } from './registry';
import { ScrapedProduct } from './plugin';

export interface RunnerResult {
  pluginId: string;
  pluginName: string;
  success: boolean;
  products: ScrapedProduct[];
  pagesScraped: number;
  error?: string;
  durationMs: number;
}

export interface RunnerStats {
  total: number;
  succeeded: number;
  failed: number;
  totalProducts: number;
  totalDurationMs: number;
  results: RunnerResult[];
}

export class ScrapingRunner {
  private registry: PluginRegistry;

  constructor(registry: PluginRegistry) {
    this.registry = registry;
  }

  async runAll(pluginIds: string[], pagesPerPlugin = 1): Promise<RunnerStats> {
    const startTime = Date.now();
    const results: RunnerResult[] = [];
    let totalProducts = 0;

    for (const id of pluginIds) {
      const plugin = this.registry.get(id);
      if (!plugin) {
        results.push({
          pluginId: id,
          pluginName: id,
          success: false,
          products: [],
          pagesScraped: 0,
          error: `Plugin "${id}" not found in registry`,
          durationMs: 0,
        });
        continue;
      }

      const pluginStart = Date.now();
      const allProducts: ScrapedProduct[] = [];
      const maxPages = Math.min(
        pagesPerPlugin,
        plugin.pagination?.maxPages ?? 1
      );

      try {
        for (let p = 1; p <= maxPages; p++) {
          const pageProducts = await plugin.scrape(p);
          allProducts.push(...pageProducts);

          if (pageProducts.length === 0) break;
        }

        results.push({
          pluginId: plugin.id,
          pluginName: plugin.name,
          success: true,
          products: allProducts,
          pagesScraped: maxPages,
          durationMs: Date.now() - pluginStart,
        });
        totalProducts += allProducts.length;
      } catch (err) {
        results.push({
          pluginId: plugin.id,
          pluginName: plugin.name,
          success: false,
          products: allProducts,
          pagesScraped: maxPages,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - pluginStart,
        });
        totalProducts += allProducts.length;
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      total: results.length,
      succeeded,
      failed,
      totalProducts,
      totalDurationMs: Date.now() - startTime,
      results,
    };
  }

  async runByIds(pluginIds: string[], pagesPerPlugin = 1): Promise<RunnerStats> {
    return this.runAll(pluginIds, pagesPerPlugin);
  }
}
