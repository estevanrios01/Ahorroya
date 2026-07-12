'use client';

import { useEffect } from 'react';

const RELOAD_FLAG = 'ahorroya:chunk-reload';

function shouldRecover(message) {
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(String(message || ''));
}

export default function ChunkRecovery() {
  useEffect(() => {
    function recoverOnce(error) {
      const message = error?.reason?.message || error?.message || error?.error?.message;
      if (!shouldRecover(message)) return;
      if (sessionStorage.getItem(RELOAD_FLAG) === '1') return;
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
    }

    function clearFlag() {
      sessionStorage.removeItem(RELOAD_FLAG);
    }

    window.addEventListener('error', recoverOnce);
    window.addEventListener('unhandledrejection', recoverOnce);
    window.addEventListener('load', clearFlag);

    return () => {
      window.removeEventListener('error', recoverOnce);
      window.removeEventListener('unhandledrejection', recoverOnce);
      window.removeEventListener('load', clearFlag);
    };
  }, []);

  return null;
}
