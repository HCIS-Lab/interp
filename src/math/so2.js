// SO(2) SLERP via De Moivre / complex exponential

import { EPSILON } from './utils.js';

/**
 * Wrap an angle to [-π, π].
 */
export function wrapAngle(a) {
  // Bring to [0, 2π) then shift
  let r = a % (2 * Math.PI);
  if (r > Math.PI) r -= 2 * Math.PI;
  if (r < -Math.PI) r += 2 * Math.PI;
  return r;
}

/**
 * Build a 2×2 rotation matrix from angle θ.
 * Returns [cos, -sin, sin, cos] in row-major order.
 */
export function rotationMatrix2D(theta) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [c, -s, s, c];
}

/**
 * SO(2) SLERP via angle interpolation (De Moivre).
 *
 * @param {number} theta0 - Start angle in radians
 * @param {number} theta1 - End angle in radians
 * @param {number} s - Interpolation parameter in [0, 1]
 * @returns {{ angle: number, matrix: number[] }}
 *   matrix is [cos, -sin, sin, cos] in row-major 2×2
 */
export function so2Slerp(theta0, theta1, s) {
  // Compute angular difference, wrapped to shortest arc [-π, π]
  const deltaTheta = wrapAngle(theta1 - theta0);

  // Interpolated angle: θ(s) = θ₀ + s · Δθ
  const angle = theta0 + s * deltaTheta;

  return {
    angle,
    matrix: rotationMatrix2D(angle),
    deltaTheta,
  };
}
