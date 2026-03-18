// Generic interpolation hook: manages s state and animation

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * @param {Function} interpFn - (start, end, s) => result
 * @param {*} start - Start value
 * @param {*} end   - End value
 * @returns {{ s, setS, result, isPlaying, togglePlay, reset }}
 */
export function useInterpolation(interpFn, start, end) {
  const [s, setS] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const directionRef = useRef(1); // 1 = forward, -1 = backward
  const DURATION = 2000; // ms for full 0→1 traversal

  const result = interpFn(start, end, s);

  const stopAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimeRef.current = null;
  }, []);

  const animate = useCallback((timestamp) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }
    const dt = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setS((prev) => {
      const step = (dt / DURATION) * directionRef.current;
      let next = prev + step;
      if (next >= 1) {
        next = 1;
        directionRef.current = -1;
      } else if (next <= 0) {
        next = 0;
        directionRef.current = 1;
      }
      return next;
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (prev) {
        stopAnimation();
        return false;
      } else {
        rafRef.current = requestAnimationFrame(animate);
        return true;
      }
    });
  }, [animate, stopAnimation]);

  const reset = useCallback(() => {
    stopAnimation();
    setIsPlaying(false);
    setS(0);
    directionRef.current = 1;
  }, [stopAnimation]);

  // Cleanup on unmount
  useEffect(() => () => stopAnimation(), [stopAnimation]);

  return { s, setS, result, isPlaying, togglePlay, reset };
}
