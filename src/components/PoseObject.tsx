// An asymmetric 3D object that clearly shows orientation
// Body = box + cone (nose) + three colored axis cylinders
// Transform is applied by the PARENT group — this component has no transform props.

interface Props {
  color?: string;
  opacity?: number;
  wireframe?: boolean;
}

export default function PoseObject({ color = '#ffffff', opacity = 1, wireframe = false }: Props) {
  return (
    <group>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.4, 0.25, 0.6]} />
        <meshStandardMaterial color={color} opacity={opacity} transparent={opacity < 1} wireframe={wireframe} />
      </mesh>

      {/* Nose cone (pointing +Z) */}
      <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.25, 12]} />
        <meshStandardMaterial color={color} opacity={opacity} transparent={opacity < 1} wireframe={wireframe} />
      </mesh>

      {/* Local X axis (red) */}
      <mesh position={[0.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="#ff4444" opacity={opacity} transparent={opacity < 1} />
      </mesh>
      <mesh position={[0.65, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.12, 8]} />
        <meshStandardMaterial color="#ff4444" opacity={opacity} transparent={opacity < 1} />
      </mesh>

      {/* Local Y axis (green) */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="#44ff44" opacity={opacity} transparent={opacity < 1} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <coneGeometry args={[0.05, 0.12, 8]} />
        <meshStandardMaterial color="#44ff44" opacity={opacity} transparent={opacity < 1} />
      </mesh>

      {/* Local Z axis (blue) */}
      <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="#4444ff" opacity={opacity} transparent={opacity < 1} />
      </mesh>
      <mesh position={[0, 0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.12, 8]} />
        <meshStandardMaterial color="#4444ff" opacity={opacity} transparent={opacity < 1} />
      </mesh>
    </group>
  );
}
