import { useEffect, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

type Props = {
  phrases: string[];
  className?: string;
  cursorClassName?: string;
};

export default function Typewriter({ phrases, className, cursorClassName }: Props) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const phrase = phrases[index];
    let delay = deleting ? 38 : 70;
    if (!deleting && length === phrase.length) delay = 1800;
    else if (deleting && length === 0) delay = 350;

    const timer = window.setTimeout(() => {
      if (!deleting && length === phrase.length) setDeleting(true);
      else if (deleting && length === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      } else setLength((l) => l + (deleting ? -1 : 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [phrases, index, length, deleting, reduced]);

  const text = reduced ? phrases[0] : phrases[index].slice(0, length);

  return (
    <span className={className} aria-live="polite" aria-atomic="true">
      {text}
      <span className={cursorClassName} aria-hidden="true">|</span>
    </span>
  );
}
