
import styles from './ResetButton.module.css';

interface Props {
  onClick: () => void;
  label?: string;
}

export default function ResetButton({ onClick, label = 'Reset' }: Props) {
  return (
    <button className={styles.btn} onClick={onClick}>
      ↺ {label}
    </button>
  );
}
