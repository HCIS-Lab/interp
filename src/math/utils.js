// Shared math utilities — NO Three.js imports

export const EPSILON = 1e-7;

/** Clamp value to [min, max] */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Multiply two n×n matrices stored as flat row-major arrays */
export function matMul(A, B, n) {
  const C = new Array(n * n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i * n + k] * B[k * n + j];
      }
      C[i * n + j] = sum;
    }
  }
  return C;
}

/** Transpose an n×n matrix (flat row-major array) */
export function transpose(M, n) {
  const T = new Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      T[j * n + i] = M[i * n + j];
    }
  }
  return T;
}

/** Trace of an n×n matrix */
export function trace(M, n) {
  let t = 0;
  for (let i = 0; i < n; i++) t += M[i * n + i];
  return t;
}

/** 3-vector → 3×3 skew-symmetric matrix [v]_x (row-major, 9 elements) */
export function skewSymmetric(v) {
  const [vx, vy, vz] = v;
  return [
     0,  -vz,  vy,
     vz,   0, -vx,
    -vy,  vx,   0,
  ];
}

/** Square of a 3×3 skew-symmetric matrix S → S² (row-major, 9 elements) */
export function skewSquared(S) {
  return matMul(S, S, 3);
}

/** n×n identity matrix as flat row-major array */
export function identity(n) {
  const I = new Array(n * n).fill(0);
  for (let i = 0; i < n; i++) I[i * n + i] = 1;
  return I;
}

/** Multiply n×n matrix M by n-vector v, returns n-vector */
export function matVecMul(M, v, n) {
  const result = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i] += M[i * n + j] * v[j];
    }
  }
  return result;
}

export function vecAdd(a, b) {
  return a.map((ai, i) => ai + b[i]);
}

export function vecSub(a, b) {
  return a.map((ai, i) => ai - b[i]);
}

export function vecScale(a, s) {
  return a.map((ai) => ai * s);
}

export function vecDot(a, b) {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0);
}

export function vecNorm(a) {
  return Math.sqrt(vecDot(a, a));
}

export function vecNormalize(a) {
  const n = vecNorm(a);
  if (n < EPSILON) return a.slice();
  return vecScale(a, 1 / n);
}

/**
 * Invert a 3×3 matrix (row-major, 9 elements).
 * Uses cofactor/adjugate method.
 */
export function mat3Inverse(M) {
  const [m00, m01, m02,
         m10, m11, m12,
         m20, m21, m22] = M;

  // Cofactors
  const c00 = m11 * m22 - m12 * m21;
  const c01 = -(m10 * m22 - m12 * m20);
  const c02 = m10 * m21 - m11 * m20;
  const c10 = -(m01 * m22 - m02 * m21);
  const c11 = m00 * m22 - m02 * m20;
  const c12 = -(m00 * m21 - m01 * m20);
  const c20 = m01 * m12 - m02 * m11;
  const c21 = -(m00 * m12 - m02 * m10);
  const c22 = m00 * m11 - m01 * m10;

  const det = m00 * c00 + m01 * c01 + m02 * c02;
  if (Math.abs(det) < EPSILON) return identity(3);

  const invDet = 1 / det;
  // Transpose of cofactor matrix (adjugate), scaled by 1/det
  return [
    c00 * invDet, c10 * invDet, c20 * invDet,
    c01 * invDet, c11 * invDet, c21 * invDet,
    c02 * invDet, c12 * invDet, c22 * invDet,
  ];
}

/** Scale a matrix by scalar s (flat array) */
export function matScale(M, s) {
  return M.map((v) => v * s);
}

/** Add two matrices element-wise */
export function matAdd(A, B) {
  return A.map((v, i) => v + B[i]);
}
