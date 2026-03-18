import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from './FormulaBlock.module.css';

interface Props {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export default function FormulaBlock({ latex, displayMode = true, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    katex.render(latex, ref.current, {
      displayMode,
      throwOnError: false,
      trust: false,
    });
  }, [latex, displayMode]);

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <span ref={ref} />
    </div>
  );
}
