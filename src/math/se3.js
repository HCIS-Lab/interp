// SE(3) ScLERP via 4×4 homogeneous matrix

import {
  EPSILON, clamp, matMul, transpose, trace,
  skewSymmetric, skewSquared, identity, matScale, matAdd,
  matVecMul, vecSub, mat3Inverse,
} from './utils.js';
import { extractAxisAngle, rodrigues } from './so3.js';

/**
 * Extract rotation (3×3) and translation (3-vector) from a 4×4 row-major matrix.
 */
export function extractRT(X) {
  const R = [
    X[0],  X[1],  X[2],
    X[4],  X[5],  X[6],
    X[8],  X[9],  X[10],
  ];
  const p = [X[3], X[7], X[11]];
  return { R, p };
}

/**
 * Build a 4×4 row-major homogeneous matrix from R (3×3) and p (3-vector).
 */
export function buildSE3(R, p) {
  return [
    R[0], R[1], R[2], p[0],
    R[3], R[4], R[5], p[1],
    R[6], R[7], R[8], p[2],
    0,    0,    0,    1,
  ];
}

/**
 * Compute G(θ) = I - (1 - cos θ)/θ · [ω̂]_x + (θ - sin θ)/θ · [ω̂]²_x
 *
 * This maps the linear component of a twist to a translation in SE(3).
 * For θ ≈ 0: G → I (identity).
 */
function computeG(skew, theta) {
  if (theta < EPSILON) return identity(3);

  const skew2 = skewSquared(skew);
  const a = (1 - Math.cos(theta)) / theta;
  const b = (theta - Math.sin(theta)) / theta;

  // G(θ) = I - a·[ω̂]_x + b·[ω̂]²_x
  return matAdd(matAdd(identity(3), matScale(skew, -a)), matScale(skew2, b));
}

/**
 * SE(3) ScLERP via 4×4 homogeneous matrix.
 *
 * @param {number[]} X0 - Start pose (4×4 row-major)
 * @param {number[]} X1 - End pose (4×4 row-major)
 * @param {number} s  - Interpolation parameter [0, 1]
 * @returns {number[]} Interpolated pose (4×4 row-major)
 */
export function se3ScLERP(X0, X1, s) {
  // Step 1: Extract R0, p0 and R1, p1
  const { R: R0, p: p0 } = extractRT(X0);
  const { R: R1, p: p1 } = extractRT(X1);

  // Step 2: ΔR = R0ᵀ · R1
  const R0T = transpose(R0, 3);
  const deltaR = matMul(R0T, R1, 3);

  // Extract θ and [ω̂]_x
  const { theta, skew } = extractAxisAngle(deltaR);

  // Step 3: Δp = R0ᵀ · (p1 - p0)
  const dp = vecSub(p1, p0);
  const deltap = matVecMul(R0T, dp, 3);

  if (theta < EPSILON) {
    // Pure translation: X(s) = [R0, R0·(s·Δp) + p0]
    const ps = [
      p0[0] + s * dp[0],
      p0[1] + s * dp[1],
      p0[2] + s * dp[2],
    ];
    return buildSE3(R0, ps);
  }

  // Step 4: G(θ) and v = G(θ)⁻¹ · Δp
  const G = computeG(skew, theta);
  const Ginv = mat3Inverse(G);
  const v = matVecMul(Ginv, deltap, 3);

  // Step 5: Interpolate at parameter s
  // ΔR(s) = Rodrigues(skew, θ, s)
  const deltaRS = rodrigues(skew, theta, s);

  // Δp(s) = G(sθ) · (s · v)
  const Gs = computeG(skew, s * theta);
  const deltapS = matVecMul(Gs, [s*v[0], s*v[1], s*v[2]], 3);

  // Step 6: Reconstruct X(s) = [R0·ΔR(s), R0·Δp(s) + p0; 0, 1]
  const Rs = matMul(R0, deltaRS, 3);
  const Rs_dp = matVecMul(R0, deltapS, 3);
  const ps = [p0[0] + Rs_dp[0], p0[1] + Rs_dp[1], p0[2] + Rs_dp[2]];

  return buildSE3(Rs, ps);
}
