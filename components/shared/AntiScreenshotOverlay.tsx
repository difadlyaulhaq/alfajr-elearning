// components/shared/AntiScreenshotOverlay.tsx
"use client";

import { useEffect } from 'react';

/**
 * Lightweight overlay untuk merusak screenshot
 * Optimized untuk performa - minimal lag
 */
export const AntiScreenshotOverlay = () => {
  useEffect(() => {
    // Single global style - no state updates untuk performa
    const style = document.createElement('style');
    style.textContent = `
      /* Invisible pattern yang capture di screenshot */
      .screen-protected::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.01) 48%, rgba(0,0,0,0.01) 52%, transparent 52%);
        background-size: 3px 3px;
        pointer-events: none;
        z-index: 99996;
        mix-blend-mode: multiply;
        will-change: transform;
      }
    `;
    document.head.appendChild(style);

    return () => style.remove();
  }, []);

  // Static overlay - no re-renders
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.005) 2px, rgba(0,0,0,0.005) 4px)',
        pointerEvents: 'none',
        zIndex: 99995,
        mixBlendMode: 'multiply',
        willChange: 'transform',
      }}
    />
  );
};
