'use client';

import { useEffect, useState, useRef } from 'react';

const SIZE = 120; // big circle diameter in px (tawai-style)
const SMOOTH = 0.15; // lerp factor for smooth follow

export function LandingCursor() {
  const [pos, setPos] = useState({ x: -SIZE, y: -SIZE });
  const targetRef = useRef({ x: -SIZE, y: -SIZE });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMove);

    let raf = 0;
    const animate = () => {
      const t = targetRef.current;
      setPos((prev) => ({
        x: prev.x + (t.x - prev.x) * SMOOTH,
        y: prev.y + (t.y - prev.y) * SMOOTH,
      }));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9999] rounded-full bg-white/5 backdrop-blur-[2px] transition-opacity duration-300"
      style={{
        width: SIZE,
        height: SIZE,
        left: pos.x - SIZE / 2,
        top: pos.y - SIZE / 2,
      }}
      aria-hidden
    />
  );
}
