// FocusTrap — small accessibility utility. Wraps any modal/dialog
// content in a div that:
//   1. Auto-focuses the first focusable child on mount
//   2. Cycles Tab / Shift-Tab inside the trap (instead of escaping
//      to the page behind, which is the default browser behavior
//      and makes keyboard users get lost in modals)
//
// Usage:
//   <FocusTrap onEscape={onClose}>
//     <div>…modal contents…</div>
//   </FocusTrap>
//
// Notes:
//   - We only trap Tab; the rest of the keyboard works normally.
//   - Escape calls the optional onEscape callback so dialogs can
//     close-on-escape without each one wiring up its own handler.
//   - The trap doesn't try to be perfect — it queries focusable
//     elements at the moment Tab fires, so dynamically-inserted
//     focusables work too.

'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export default function FocusTrap({
  children,
  onEscape,
}: {
  children: ReactNode;
  onEscape?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Auto-focus the first focusable child. autoFocus on the input
    // already covers most cases, but this is a backstop for dialogs
    // that don't have an obvious entry point.
    const initialFocusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const alreadyFocused = container.contains(document.activeElement);
    if (!alreadyFocused && initialFocusables.length > 0) {
      // Defer to next tick so any auto-focusing inputs win the race.
      const id = window.setTimeout(() => {
        const stillNotFocused = !container.contains(document.activeElement);
        if (stillNotFocused) initialFocusables[0].focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const container = containerRef.current;
      if (!container) return;

      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(el => !el.hasAttribute('disabled'));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onEscape]);

  return <div ref={containerRef}>{children}</div>;
}
