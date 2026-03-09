import React, { useCallback, useRef } from 'react';

interface TiltOptions {
  maxRotation?: number;
  perspective?: number;
  scale?: number;
  glowColor?: string;
}

export function useTilt(options: TiltOptions = {}) {
  const {
    maxRotation = 8,
    perspective = 800,
    scale = 1.02,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (0.5 - y) * maxRotation;
      const rotateY = (x - 0.5) * maxRotation;

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

      // Dynamic shadow based on cursor position
      const shadowX = (x - 0.5) * 20;
      const shadowY = (y - 0.5) * 20;
      el.style.boxShadow = `${-shadowX}px ${-shadowY}px 30px rgba(245, 158, 11, 0.08), 0 0 20px rgba(0,0,0,0.3)`;
    });
  }, [maxRotation, perspective, scale]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.style.transform = '';
    el.style.boxShadow = '';
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
