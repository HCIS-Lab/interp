import React from 'react';
import { Link } from 'react-router-dom';
import FormulaBlock from '../components/FormulaBlock';
import styles from './HomePage.module.css';

const CARDS = [
  {
    path: '/so2',
    group: 'SO(2)',
    dim: '2D',
    rep: '2×2 Rotation Matrix',
    method: 'SLERP — De Moivre',
    desc: 'Interpolate 2D rotations via angle on the unit circle.',
    color: 'var(--accent-blue)',
  },
  {
    path: '/so3-matrix',
    group: 'SO(3)',
    dim: '3D',
    rep: '3×3 Rotation Matrix',
    method: 'SLERP — Rodrigues',
    desc: 'Geodesic on SO(3) computed via the matrix exponential and Rodrigues formula.',
    color: 'var(--accent-purple)',
  },
  {
    path: '/so3-quaternion',
    group: 'SO(3)',
    dim: '3D',
    rep: 'Unit Quaternion (S³)',
    method: 'SLERP — Quaternion',
    desc: 'Same geodesic as above, represented on the 3-sphere in quaternion space.',
    color: 'var(--accent-yellow)',
  },
  {
    path: '/se3-sclerp',
    group: 'SE(3)',
    dim: '3D',
    rep: '4×4 Homogeneous Matrix',
    method: 'ScLERP — Matrix',
    desc: 'Screw linear interpolation: the geodesic on SE(3) couples rotation and translation.',
    color: 'var(--accent-green)',
  },
  {
    path: '/se3-dual-quat',
    group: 'SE(3)',
    dim: '3D',
    rep: 'Dual Quaternion (TS³)',
    method: 'ScLERP — Dual Quaternion',
    desc: 'Same SE(3) geodesic via the elegant dual-number quaternion algebra.',
    color: 'var(--accent-red)',
  },
  {
    path: '/se3-decoupled',
    group: 'SE(3)',
    dim: '3D',
    rep: 'Quaternion + Vector3',
    method: 'Decoupled LERP + SLERP',
    desc: 'Naive approach: interpolate translation and rotation independently. Compare with ScLERP to see the difference.',
    color: 'var(--accent-yellow)',
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>∮</div>
        <h1 className={styles.title}>Geodesic Interpolation<br />on Lie Groups</h1>
        <p className={styles.subtitle}>
          An interactive visualizer for understanding how rotations and rigid-body transformations
          interpolate along geodesics — the "straight lines" of curved spaces.
        </p>
      </div>

      {/* Background explanation */}
      <section className={styles.explainer}>
        <h2>What is a Lie Group?</h2>
        <p>
          A <strong>Lie group</strong> is a group that is also a smooth manifold — meaning it has both
          an algebraic structure (you can compose transformations) and a geometric one (you can
          "move continuously" through it). The rotation group <strong>SO(3)</strong> and the rigid-body
          transformation group <strong>SE(3)</strong> are the Lie groups most commonly encountered in
          robotics and 3D graphics.
        </p>

        <h2>What is a Geodesic?</h2>
        <p>
          On a curved space, a <strong>geodesic</strong> is the shortest path between two points —
          the generalization of a straight line. On SO(3), geodesics correspond to rotating at constant
          angular velocity. On SE(3), they correspond to <em>screw motions</em>: simultaneous rotation
          and translation along a fixed axis.
        </p>

        <h2>Why Does Interpolation Method Matter?</h2>
        <p>
          In animation, robotics, and computer vision, we often need to smoothly interpolate between
          two poses. Interpolating rotation matrices component-wise (naive LERP) leaves the manifold
          and produces non-rotation matrices. <strong>SLERP</strong> and <strong>ScLERP</strong> stay on
          the manifold and produce constant-speed geodesic paths. The decoupled method (LERP + SLERP)
          produces correct rotations and positions separately, but does <em>not</em> follow the SE(3)
          geodesic — it takes a longer, curved path.
        </p>

        <div className={styles.formulaSection}>
          <p style={{ marginBottom: 4, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            General exponential map formula:
          </p>
          <FormulaBlock latex={String.raw`g(s) = g_0 \cdot \exp\!\left(s \cdot \log(g_0^{-1} g_1)\right)`} />
        </div>
      </section>

      {/* Cards */}
      <section className={styles.cardSection}>
        <h2 className={styles.cardSectionTitle}>Explore Interpolation Methods</h2>
        <div className={styles.cards}>
          {CARDS.map(({ path, group, dim, rep, method, desc, color }) => (
            <Link to={path} key={path} className={styles.card} style={{ '--card-color': color } as React.CSSProperties}>
              <div className={styles.cardHeader}>
                <span className={styles.cardGroup} style={{ color }}>{group}</span>
                <span className={styles.cardDim}>{dim}</span>
              </div>
              <div className={styles.cardRep}>{rep}</div>
              <div className={styles.cardMethod}>{method}</div>
              <p className={styles.cardDesc}>{desc}</p>
              <div className={styles.cardArrow}>Explore →</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
