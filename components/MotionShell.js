import styles from "../styles/MotionShell.module.css";

export default function MotionShell({ sceneKey, children }) {
  return (
    <div className={styles.shell} key={sceneKey} data-motion-scene={sceneKey}>
      {children}
    </div>
  );
}
