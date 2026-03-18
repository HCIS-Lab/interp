
import styles from './MatrixDisplay.module.css';

interface Props {
  matrix: number[];
  rows: number;
  cols: number;
  label?: string;
  color?: string;
}

export default function MatrixDisplay({ matrix, rows: _rows, cols, label, color }: Props) {
  return (
    <div className={styles.container}>
      {label && (
        <div className={styles.label} style={{ color: color ?? 'var(--text-secondary)' }}>
          {label}
        </div>
      )}
      <div className={styles.matrixWrapper}>
        <span className={styles.bracket}>[</span>
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {matrix.map((v, i) => (
            <span key={i} className={styles.cell}>
              {Number.isFinite(v) ? v.toFixed(4) : '?'}
            </span>
          ))}
        </div>
        <span className={styles.bracket}>]</span>
      </div>
    </div>
  );
}
