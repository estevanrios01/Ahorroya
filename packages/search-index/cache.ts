const cache = new Map<string, unknown>();

export function cached(key: string, factory: () => unknown) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const value = factory();
  cache.set(key, value);
  return value;
}
