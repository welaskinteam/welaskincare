import { useEffect } from "react";
import "@/styles/globals.css";

import { initializeLiff } from "../services/liff";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    initializeLiff().catch((error) => {
      console.error("LIFF initialization failed:", error);
    });
  }, []);

  return <Component {...pageProps} />;
}
