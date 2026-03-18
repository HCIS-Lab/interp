// Decoupled LERP (translation) + Three.js SLERP (rotation)
// This is the ONLY file that uses Three.js built-in Quaternion.slerp()

import * as THREE from 'three';

/**
 * Decoupled interpolation: LERP for translation, Three.js SLERP for rotation.
 *
 * @param {THREE.Quaternion} q0
 * @param {THREE.Vector3} p0
 * @param {THREE.Quaternion} q1
 * @param {THREE.Vector3} p1
 * @param {number} s
 * @returns {{ quaternion: THREE.Quaternion, position: THREE.Vector3 }}
 */
export function decoupledLerpSlerp(q0, p0, q1, p1, s) {
  // LERP for translation: p(s) = (1 - s) · p0 + s · p1
  const position = new THREE.Vector3().lerpVectors(p0, p1, s);

  // Three.js built-in SLERP for rotation (only allowed usage)
  const quaternion = q0.clone().slerp(q1, s);

  return { quaternion, position };
}
