'use client';
import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { cn } from '@/lib/utils';

export type SpotlightProps = {
  className?: string;
  size?: number;
};

// From motion-primitives' Spotlight, changed to track the pointer directly (the stock spring made
// the glow trail the cursor and fly in from the corner on entry), to position with a transform
// instead of left/top, and to use the site's accent color (the stock zinc gradient relied on
// Tailwind v3's --tw-gradient-stops).
export function Spotlight({ className, size = 200 }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    parent.style.position = 'relative';
    parent.style.overflow = 'hidden';

    const track = (e: PointerEvent) => {
      const { left, top } = parent.getBoundingClientRect();
      x.set(e.clientX - left - size / 2);
      y.set(e.clientY - top - size / 2);
    };
    const enter = (e: PointerEvent) => {
      track(e);
      setIsHovered(true);
    };
    const leave = () => setIsHovered(false);

    const abort = new AbortController();
    const { signal } = abort;
    parent.addEventListener('pointerenter', enter, { signal });
    parent.addEventListener('pointermove', track, { signal });
    parent.addEventListener('pointerleave', leave, { signal });
    return () => abort.abort();
  }, [size, x, y]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute top-0 left-0 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent)_26%,transparent),transparent_72%)] blur-xl transition-opacity duration-200',
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ width: size, height: size, x, y }}
    />
  );
}
