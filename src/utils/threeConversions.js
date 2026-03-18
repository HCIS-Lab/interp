// Conversion helpers between math (row-major arrays) and Three.js types
// CRITICAL: Three.js Matrix4.elements is COLUMN-MAJOR — must transpose!

import * as THREE from 'three';

/**
 * Three.js Matrix4 → 16-element row-major array
 * Three.js stores elements in column-major order.
 */
export function matrix4ToArray(m4) {
  // m4.elements is column-major: [m00, m10, m20, m30, m01, m11, ...]
  const e = m4.elements;
  return [
    e[0],  e[4],  e[8],  e[12],
    e[1],  e[5],  e[9],  e[13],
    e[2],  e[6],  e[10], e[14],
    e[3],  e[7],  e[11], e[15],
  ];
}

/**
 * 16-element row-major array → Three.js Matrix4
 */
export function arrayToMatrix4(arr) {
  const m = new THREE.Matrix4();
  // Three.js set() takes row-major arguments
  m.set(
    arr[0],  arr[1],  arr[2],  arr[3],
    arr[4],  arr[5],  arr[6],  arr[7],
    arr[8],  arr[9],  arr[10], arr[11],
    arr[12], arr[13], arr[14], arr[15],
  );
  return m;
}

/**
 * 9-element row-major 3×3 → Three.js Matrix4 (rotation only, translation=0)
 */
export function mat3ToMatrix4(arr) {
  const m = new THREE.Matrix4();
  m.set(
    arr[0], arr[1], arr[2], 0,
    arr[3], arr[4], arr[5], 0,
    arr[6], arr[7], arr[8], 0,
    0,      0,      0,      1,
  );
  return m;
}

/**
 * Three.js Quaternion → [w, x, y, z] array (scalar-first)
 */
export function quaternionToArray(q) {
  return [q.w, q.x, q.y, q.z];
}

/**
 * [w, x, y, z] array → Three.js Quaternion
 */
export function arrayToQuaternion(arr) {
  return new THREE.Quaternion(arr[1], arr[2], arr[3], arr[0]);
}

/**
 * Three.js Vector3 → [x, y, z] array
 */
export function vector3ToArray(v) {
  return [v.x, v.y, v.z];
}

/**
 * [x, y, z] array → Three.js Vector3
 */
export function arrayToVector3(arr) {
  return new THREE.Vector3(arr[0], arr[1], arr[2]);
}

/**
 * Extract 3×3 rotation (row-major) from a Three.js Object3D's quaternion.
 */
export function object3DToRotationArray(obj) {
  const q = new THREE.Quaternion();
  obj.getWorldQuaternion(q);
  const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
  const e = m.elements; // column-major
  return [
    e[0], e[4], e[8],
    e[1], e[5], e[9],
    e[2], e[6], e[10],
  ];
}

/**
 * Extract 4×4 SE(3) matrix from a Three.js Object3D's position + quaternion.
 */
export function object3DToSE3Array(obj) {
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  obj.getWorldQuaternion(q);
  obj.getWorldPosition(p);
  const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1));
  return matrix4ToArray(m);
}
