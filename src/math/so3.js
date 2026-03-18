// SO(3) SLERP via rotation matrix (Rodrigues formula)

import {
  EPSILON, clamp, matMul, transpose, trace,
  skewSymmetric, skewSquared, identity, matScale, matAdd,
} from './utils.js';

/**
 * Extract the rotation axis (unit vector) and angle from a relative rotation matrix.
 * @param {number[]} deltaR - 3×3 row-major rotation matrix
 * @returns {{ theta: number, omegaHat: number[], skew: number[] }}
 */
export function extractAxisAngle(deltaR) {
  // Step 1: θ = arccos((tr(ΔR) - 1) / 2)
  const cosTheta = clamp((trace(deltaR, 3) - 1) / 2, -1, 1);
  const theta = Math.acos(cosTheta);

  if (theta < EPSILON) {
    // Near identity — no rotation
    return { theta: 0, omegaHat: [0, 0, 1], skew: [0,0,0, 0,0,0, 0,0,0] };
  }

  // Step 2: [ω̂]_x = (ΔR - ΔRᵀ) / (2 sin θ)
  const deltaRT = transpose(deltaR, 3);
  const sinTheta = Math.sin(theta);
  const skew = deltaR.map((v, i) => (v - deltaRT[i]) / (2 * sinTheta));

  // Extract ω̂ from skew-symmetric matrix:
  // [ω̂]_x = [ 0, -wz, wy; wz, 0, -wx; -wy, wx, 0 ]
  const omegaHat = [skew[7], skew[2], skew[3]]; // [wx, wy, wz]

  return { theta, omegaHat, skew };
}

/**
 * Rodrigues rotation formula: rotate identity by axis-angle representation.
 * ΔR(s) = I + sin(sθ) [ω̂]_x + (1 - cos(sθ)) [ω̂]²_x
 *
 * @param {number[]} skew - 3×3 skew-symmetric matrix [ω̂]_x
 * @param {number} theta - Total angle
 * @param {number} s - Interpolation parameter
 * @returns {number[]} 3×3 rotation matrix
 */
export function rodrigues(skew, theta, s) {
  const sTheta = s * theta;
  const sinST = Math.sin(sTheta);
  const cosST = Math.cos(sTheta);

  const I = identity(3);
  const skew2 = skewSquared(skew);

  // ΔR(s) = I + sin(sθ)[ω̂]_x + (1 - cos(sθ))[ω̂]²_x
  return matAdd(matAdd(I, matScale(skew, sinST)), matScale(skew2, 1 - cosST));
}

/**
 * SO(3) SLERP via rotation matrix (axis-angle / Rodrigues).
 * All matrices are 9-element arrays in ROW-MAJOR order.
 *
 * @param {number[]} R0 - Start rotation (3×3 row-major)
 * @param {number[]} R1 - End rotation (3×3 row-major)
 * @param {number} s  - Interpolation parameter [0, 1]
 * @returns {number[]} Interpolated rotation matrix (3×3 row-major)
 */
export function so3MatrixSlerp(R0, R1, s) {
  // Step 1: ΔR = R0ᵀ · R1
  const R0T = transpose(R0, 3);
  const deltaR = matMul(R0T, R1, 3);

  // Step 2–4: extract θ and [ω̂]_x
  const { theta, skew } = extractAxisAngle(deltaR);

  if (theta < EPSILON) {
    // Degenerate: return R0 (no rotation)
    return R0.slice();
  }

  // Step 5: ΔR(s) = Rodrigues formula
  const deltaRS = rodrigues(skew, theta, s);

  // Step 6: R(s) = R0 · ΔR(s)
  return matMul(R0, deltaRS, 3);
}

/**
 * Returns θ (geodesic angle) between R0 and R1 in radians.
 */
export function so3GeodesicAngle(R0, R1) {
  const R0T = transpose(R0, 3);
  const deltaR = matMul(R0T, R1, 3);
  const { theta } = extractAxisAngle(deltaR);
  return theta;
}
