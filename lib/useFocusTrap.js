'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Keeps Tab/Shift+Tab cycling inside the modal instead of escaping into the
// page behind it, and returns focus to whatever triggered the modal once it
// closes -- neither AuthModal nor ListaCompras had this, so a keyboard or
// screen-reader user could tab straight out of an open dialog into
// background content.
export function useFocusTrap(active = true) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const previouslyFocused = document.activeElement;

    function handleKeyDown(event) {
      if (event.key !== 'Tab' || !containerRef.current) return;
      const focusable = Array.from(containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [active]);

  return containerRef;
}
