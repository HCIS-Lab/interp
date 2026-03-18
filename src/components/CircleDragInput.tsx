import React, { useRef, useCallback } from 'react';
import styles from './CircleDragInput.module.css';

interface AngleHandle {
  angle: number;
  color: string;
  label: string;
}

interface Props {
  handles: AngleHandle[];
  onAngleChange: (index: number, angle: number) => void;
  interpolatedAngle?: number;
  size?: number;
}

export default function CircleDragInput({
  handles, onAngleChange, interpolatedAngle, size = 280,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.72;

  const getAngleFromEvent = useCallback((e: MouseEvent | TouchEvent) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    return Math.atan2(y, x);
  }, [cx, cy]);

  const startDrag = useCallback((index: number) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent | TouchEvent) => {
      onAngleChange(index, getAngleFromEvent(ev));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [getAngleFromEvent, onAngleChange]);

  const angleToXY = (a: number) => ({
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  });

  // Build arc path between start and end (shortest)
  const buildArc = (a0: number, a1: number) => {
    let delta = a1 - a0;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;

    const p0 = angleToXY(a0);
    const p1 = angleToXY(a0 + delta);
    const largeArc = Math.abs(delta) > Math.PI ? 1 : 0;
    const sweep = delta >= 0 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${p1.x} ${p1.y}`;
  };

  return (
    <div className={styles.wrapper}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className={styles.svg}
      >
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c5cfe8" strokeWidth={1.5} />

        {/* Tick marks */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * 2 * Math.PI;
          const inner = r * 0.92;
          return (
            <line
              key={i}
              x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)}
              x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
              stroke="#c5cfe8" strokeWidth={1}
            />
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill="#9ca3af" />

        {/* Interpolation arc */}
        {handles.length >= 2 && interpolatedAngle !== undefined && (
          <>
            <path
              d={buildArc(handles[0].angle, handles[1].angle)}
              fill="none"
              stroke="rgba(22,163,74,0.25)"
              strokeWidth={3}
              strokeDasharray="6 3"
            />
          </>
        )}

        {/* Lines from center to handles */}
        {handles.map(({ angle, color }, i) => {
          const { x, y } = angleToXY(angle);
          return (
            <line
              key={i}
              x1={cx} y1={cy} x2={x} y2={y}
              stroke={color}
              strokeWidth={1.5}
              opacity={0.5}
              strokeDasharray="4 3"
            />
          );
        })}

        {/* Interpolated arrow */}
        {interpolatedAngle !== undefined && (() => {
          return (
            <>
              <line
                x1={cx} y1={cy}
                x2={cx + r * Math.cos(interpolatedAngle)}
                y2={cy + r * Math.sin(interpolatedAngle)}
                stroke="#16a34a"
                strokeWidth={2.5}
              />
              <circle
                cx={cx + r * Math.cos(interpolatedAngle)}
                cy={cy + r * Math.sin(interpolatedAngle)}
                r={5}
                fill="#16a34a"
                opacity={0.8}
              />
            </>
          );
        })()}

        {/* Draggable handles */}
        {handles.map(({ angle, color, label }, i) => {
          const { x, y } = angleToXY(angle);
          return (
            <g key={i}>
              <circle
                cx={x} cy={y} r={12}
                fill={color}
                fillOpacity={0.25}
                stroke={color}
                strokeWidth={2}
                style={{ cursor: 'grab' }}
                onMouseDown={startDrag(i)}
                onTouchStart={startDrag(i)}
              />
              <text
                x={x} y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize={9}
                fontWeight="bold"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
