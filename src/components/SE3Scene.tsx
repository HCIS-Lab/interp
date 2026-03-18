// SE(3) 3D scene — rotation + translation
// Same fix as SO3Scene: TransformControls must be a SIBLING of its target.

import { useRef, useState, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import Scene3D from './Scene3D';
import PoseObject from './PoseObject';

interface Props {
  X0: number[];
  X1: number[];
  Xs: number[];
  onX0Change: (X: number[]) => void;
  onX1Change: (X: number[]) => void;
  overlayXs?: number[] | null;
  overlayColor?: string;
}

function applyX4(obj: THREE.Object3D, X: number[]) {
  const m4 = new THREE.Matrix4().set(
    X[0],  X[1],  X[2],  X[3],
    X[4],  X[5],  X[6],  X[7],
    X[8],  X[9],  X[10], X[11],
    X[12], X[13], X[14], X[15],
  );
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  m4.decompose(p, q, s);
  obj.position.copy(p);
  obj.quaternion.copy(q);
}

function readX4(obj: THREE.Object3D): number[] {
  const m4 = new THREE.Matrix4().compose(obj.position, obj.quaternion, new THREE.Vector3(1,1,1));
  const e = m4.elements;
  return [
    e[0], e[4], e[8],  e[12],
    e[1], e[5], e[9],  e[13],
    e[2], e[6], e[10], e[14],
    e[3], e[7], e[11], e[15],
  ];
}

export default function SE3Scene({ X0, X1, Xs, onX0Change, onX1Change, overlayXs, overlayColor = '#ffd43b' }: Props) {
  const [activeTarget, setActiveTarget] = useState<'start' | 'end'>('start');
  const [gizmoMode, setGizmoMode]       = useState<'translate' | 'rotate'>('rotate');

  const ref0 = useRef<THREE.Group>(null);
  const ref1 = useRef<THREE.Group>(null);
  const refS = useRef<THREE.Group>(null);
  const refO = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const isDragging  = useRef(false);

  const cb0 = useRef(onX0Change);
  const cb1 = useRef(onX1Change);
  useEffect(() => { cb0.current = onX0Change; });
  useEffect(() => { cb1.current = onX1Change; });

  const x0Key = X0.map(v => v.toFixed(8)).join(',');
  useEffect(() => {
    if (ref0.current && !isDragging.current) applyX4(ref0.current, X0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x0Key]);

  const x1Key = X1.map(v => v.toFixed(8)).join(',');
  useEffect(() => {
    if (ref1.current && !isDragging.current) applyX4(ref1.current, X1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x1Key]);

  const xsKey = Xs.map(v => v.toFixed(8)).join(',');
  useEffect(() => {
    if (refS.current) applyX4(refS.current, Xs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xsKey]);

  const xoKey = overlayXs ? overlayXs.map(v => v.toFixed(8)).join(',') : '';
  useEffect(() => {
    if (refO.current && overlayXs) applyX4(refO.current, overlayXs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xoKey]);

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    const onDown = () => { isDragging.current = true; };
    const onUp   = () => {
      isDragging.current = false;
      const activeRef = activeTarget === 'start' ? ref0 : ref1;
      const cb        = activeTarget === 'start' ? cb0  : cb1;
      if (activeRef.current) cb.current(readX4(activeRef.current));
    };
    ctrl.addEventListener('mouseDown', onDown);
    ctrl.addEventListener('mouseUp',   onUp);
    return () => {
      ctrl.removeEventListener('mouseDown', onDown);
      ctrl.removeEventListener('mouseUp',   onUp);
    };
  }, [activeTarget, gizmoMode]);

  const activeRef = activeTarget === 'start' ? ref0 : ref1;
  const activeCb  = activeTarget === 'start' ? cb0  : cb1;

  return (
    <div>
      <Scene3D height={460}>
        {/* Target groups — TransformControls must NOT be nested inside these */}
        <group ref={ref0}><PoseObject color="#4a9eff" opacity={0.6} /></group>
        <group ref={ref1}><PoseObject color="#ff6b6b" opacity={0.6} /></group>
        <group ref={refS}><PoseObject color="#51cf66" opacity={1}   /></group>
        {overlayXs && <group ref={refO}><PoseObject color={overlayColor} opacity={0.7} wireframe /></group>}

        {/* TransformControls as a SIBLING in the scene tree */}
        <TransformControls
          ref={controlsRef}
          object={activeRef as React.MutableRefObject<THREE.Object3D>}
          mode={gizmoMode}
          onObjectChange={() => {
            if (activeRef.current) activeCb.current(readX4(activeRef.current));
          }}
        />
      </Scene3D>

      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setActiveTarget('start')} style={{ borderColor: '#4a9eff', color: activeTarget === 'start' ? '#fff' : '#4a9eff', background: activeTarget === 'start' ? '#4a9eff' : undefined }}>
          Gizmo: Start
        </button>
        <button onClick={() => setActiveTarget('end')} style={{ borderColor: '#ff6b6b', color: activeTarget === 'end' ? '#fff' : '#ff6b6b', background: activeTarget === 'end' ? '#ff6b6b' : undefined }}>
          Gizmo: End
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>|</span>
        <button onClick={() => setGizmoMode('rotate')}    className={gizmoMode === 'rotate'    ? 'active' : ''}>Rotate</button>
        <button onClick={() => setGizmoMode('translate')} className={gizmoMode === 'translate' ? 'active' : ''}>Translate</button>
      </div>
    </div>
  );
}
