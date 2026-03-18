// Hook for circular drag input (SO(2) page)

import { useState, useCallback, useRef } from 'react';

/**
 * Returns handlers for a circular drag UI.
 * @param {number} initialAngle - Initial angle in radians
 * @param {Function} onChange - Called with new angle in radians
 */
export function useDragAngle(initialAngle, onChange) {
  const [isDragging, setIsDragging] = useState(false);
  const centerRef = useRef({ x: 0, y: 0 });

  const startDrag = useCallback((cx, cy, e) => {
    e.preventDefault();
    centerRef.current = { x: cx, y: cy };
    setIsDragging(true);

    const computeAngle = (clientX, clientY) => {
      const dx = clientX - cx;
      const dy = clientY - cy;
      return Math.atan2(dy, dx);
    };

    const onMove = (moveEvent) => {
      const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const angle = computeAngle(clientX, clientY);
      onChange(angle);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [onChange]);

  return { isDragging, startDrag };
}
