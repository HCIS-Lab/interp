import React from 'react';
import styles from './NumericPanel.module.css';

interface Props {
  label: string;
  color?: string;
  children: React.ReactNode;
}

export default function NumericPanel({ label, color = 'var(--text-secondary)', children }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.header} style={{ color }}>{label}</div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
