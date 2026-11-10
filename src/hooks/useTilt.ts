import { useCallback, useRef } from 'react';
import type { MouseEvent } from 'react';
import useReducedMotion from './useReducedMotion';

// 3D tilt + glare position. Writes --rx/--ry (degrees) and --mx/--my (%) onto
// the element so the CSS module can drive the transform and the glare spot.
export default function useTilt<T extends HTMLElement>(maxDeg = 7) {
  const ref = useRef<T>(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  const onMouseMove = useCallback((event: MouseEvent<T>) => {
    const el = ref.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${((0.5 - py) * maxDeg * 2).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((px - 0.5) * maxDeg * 2).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    });
  }, [maxDeg, reduced]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
