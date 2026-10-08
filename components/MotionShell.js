import { useEffect, useRef, useState } from "react";
import styles from "../styles/MotionShell.module.css";

export default function MotionShell({ sceneKey, children }) {
  const nextChildren = useRef(children);
  const [activeScene, setActiveScene] = useState({ key: sceneKey, children });
  const [phase, setPhase] = useState("enter");

  nextChildren.current = children;

  useEffect(() => {
    if (sceneKey === activeScene.key) {
      return undefined;
    }

    setPhase("exit");

    const timeout = window.setTimeout(() => {
      setActiveScene({ key: sceneKey, children: nextChildren.current });
      setPhase("enter");
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [activeScene.key, sceneKey]);

  const visibleChildren =
    sceneKey === activeScene.key ? children : activeScene.children;

  return (
    <div
      className={`${styles.shell} ${styles[phase]}`}
      data-motion-scene={sceneKey}
    >
      {visibleChildren}
    </div>
  );
}
