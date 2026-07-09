import { ScraperPlugin } from './plugin';

export class PluginRegistry {
  private plugins = new Map<string, ScraperPlugin>();

  register(plugin: ScraperPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin "${plugin.id}" is already registered`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  deregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  get(id: string): ScraperPlugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): ScraperPlugin[] {
    return Array.from(this.plugins.values());
  }

  getByCategory(category: 'supermercado' | 'farmacia'): ScraperPlugin[] {
    return Array.from(this.plugins.values()).filter(
      (p) => p.category === category
    );
  }

  count(): number {
    return this.plugins.size;
  }
}
