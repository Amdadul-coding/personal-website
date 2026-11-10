import { useCallback, useRef } from 'react';
import type { MouseEvent } from 'react';
import useReducedMotion from './useReducedMotion';

// Pulls the element a little toward the cursor while hovered.
export default function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  const onMouseMove = useCallback((event: MouseEvent<T>) => {
    const el = ref.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    el.style.setProperty('--tx', `${(dx * strength).toFixed(1)}px`);
    el.style.setProperty('--ty', `${(dy * strength).toFixed(1)}px`);
  }, [strength, reduced]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tx', '0px');
    el.style.setProperty('--ty', '0px');
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
