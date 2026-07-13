'use client';

import { useEffect } from 'react';

const RESET_VERSION = '2026-07-cache-reset-v1';
const RESET_KEY = 'ahorroya:cache-reset-version';

export default function ClientCacheReset() {
  useEffect(() => {
    async function resetLegacyCaches() {
      if (window.localStorage.getItem(RESET_KEY) === RESET_VERSION) return;

      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }

        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((key) => key.startsWith('ahorroya-')).map((key) => caches.delete(key)));
        }

        window.localStorage.setItem(RESET_KEY, RESET_VERSION);
      } catch {
        window.localStorage.setItem(RESET_KEY, RESET_VERSION);
      }
    }

    resetLegacyCaches();
  }, []);

  return null;
}
