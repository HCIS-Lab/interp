import React, { useRef, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  objectRef: React.RefObject<THREE.Object3D | null>;
  mode: 'translate' | 'rotate';
  onObjectChange: (matrix: THREE.Matrix4) => void;
}

export default function TransformGizmo({ objectRef, mode, onObjectChange }: Props) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleChange = () => {
      if (objectRef.current) {
        onObjectChange(objectRef.current.matrixWorld.clone());
      }
    };

    controls.addEventListener('objectChange', handleChange);
    return () => controls.removeEventListener('objectChange', handleChange);
  }, [objectRef, onObjectChange]);

  if (!objectRef.current) return null;

  return (
    <TransformControls
      ref={controlsRef}
      object={objectRef.current}
      mode={mode}
    />
  );
}
