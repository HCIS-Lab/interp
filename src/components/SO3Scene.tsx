// SO(3) 3D scene — rotation only
//
// FIX: TransformControls must be a SIBLING of the target group in the R3F tree,
// NOT a child. Being a child causes circular updateMatrixWorld calls:
//   group.updateMatrixWorld() → iterates children → TransformControls.updateMatrixWorld()
//   → TransformControls calls this.object.updateMatrixWorld() → parent group → loop

import { useRef, useState, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import Scene3D from './Scene3D';
import PoseObject from './PoseObject';

interface Props {
  R0: number[];
  R1: number[];
  Rs: number[];
  onR0Change: (R: number[]) => void;
  onR1Change: (R: number[]) => void;
}

function r3ToQuat(R: number[]): THREE.Quaternion {
  const m4 = new THREE.Matrix4().set(
    R[0], R[1], R[2], 0,
    R[3], R[4], R[5], 0,
    R[6], R[7], R[8], 0,
    0,    0,    0,    1,
  );
  return new THREE.Quaternion().setFromRotationMatrix(m4);
}

function quatToR3(q: THREE.Quaternion): number[] {
  const m4 = new THREE.Matrix4().makeRotationFromQuaternion(q);
  const e = m4.elements; // column-major
  return [e[0],e[4],e[8], e[1],e[5],e[9], e[2],e[6],e[10]];
}

export default function SO3Scene({ R0, R1, Rs, onR0Change, onR1Change }: Props) {
  const [activeTarget, setActiveTarget] = useState<'start' | 'end'>('start');

  const ref0 = useRef<THREE.Group>(null);
  const ref1 = useRef<THREE.Group>(null);
  const refS = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const isDragging = useRef(false);

  // Keep fresh callbacks to avoid stale closures in event handlers
  const cb0 = useRef(onR0Change);
  const cb1 = useRef(onR1Change);
  useEffect(() => { cb0.current = onR0Change; });
  useEffect(() => { cb1.current = onR1Change; });

  // Sync R0 → quaternion (value-based dep to avoid running every render)
  const r0Key = R0.map(v => v.toFixed(8)).join(',');
  useEffect(() => {
    if (ref0.current && !isDragging.current)
      ref0.current.quaternion.copy(r3ToQuat(R0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r0Key]);

  // Sync R1 → quaternion
  const r1Key = R1.map(v => v.toFixed(8)).join(',');
  useEffect(() => {
    if (ref1.current && !isDragging.current)
      ref1.current.quaternion.copy(r3ToQuat(R1));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r1Key]);

  // Sync Rs → quaternion (read-only, no isDragging guard needed)
  const rsKey = Rs.map(v => v.toFixed(8)).join(',');
  useEffect(() => {
    if (refS.current)
      refS.current.quaternion.copy(r3ToQuat(Rs));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rsKey]);

  // Register mouseDown/mouseUp on the TransformControls instance
  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    const onDown = () => { isDragging.current = true; };
    const onUp   = () => {
      isDragging.current = false;
      const activeRef = activeTarget === 'start' ? ref0 : ref1;
      const cb        = activeTarget === 'start' ? cb0  : cb1;
      if (activeRef.current) cb.current(quatToR3(activeRef.current.quaternion));
    };
    ctrl.addEventListener('mouseDown', onDown);
    ctrl.addEventListener('mouseUp',   onUp);
    return () => {
      ctrl.removeEventListener('mouseDown', onDown);
      ctrl.removeEventListener('mouseUp',   onUp);
    };
  }, [activeTarget]);

  const activeRef = activeTarget === 'start' ? ref0 : ref1;
  const activeCb  = activeTarget === 'start' ? cb0  : cb1;

  return (
    <div>
      <Scene3D height={460}>
        {/* Target groups — TransformControls must NOT be children of these */}
        <group ref={ref0}><PoseObject color="#4a9eff" opacity={0.6} /></group>
        <group ref={ref1}><PoseObject color="#ff6b6b" opacity={0.6} /></group>
        <group ref={refS}><PoseObject color="#51cf66" opacity={1}   /></group>

        {/* TransformControls as a SIBLING in the scene tree */}
        <TransformControls
          ref={controlsRef}
          object={activeRef as React.MutableRefObject<THREE.Object3D>}
          mode="rotate"
          onObjectChange={() => {
            if (activeRef.current)
              activeCb.current(quatToR3(activeRef.current.quaternion));
          }}
        />
      </Scene3D>

      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTarget('start')}
          style={{ borderColor: '#4a9eff', color: activeTarget === 'start' ? '#000' : '#4a9eff', background: activeTarget === 'start' ? '#4a9eff' : undefined }}
        >
          Gizmo: Start (blue)
        </button>
        <button
          onClick={() => setActiveTarget('end')}
          style={{ borderColor: '#ff6b6b', color: activeTarget === 'end' ? '#000' : '#ff6b6b', background: activeTarget === 'end' ? '#ff6b6b' : undefined }}
        >
          Gizmo: End (red)
        </button>
      </div>
    </div>
  );
}
