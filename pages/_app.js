import { useEffect } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";

import { initializeLiff } from "../services/liff";
import MotionShell from "../components/MotionShell";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    initializeLiff().catch((error) => {
      console.error("LIFF initialization failed:", error);
    });
  }, []);

  return (
    <MotionShell sceneKey={router.asPath}>
      <Component {...pageProps} />
    </MotionShell>
  );
}
