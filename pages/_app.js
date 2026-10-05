import { useEffect } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";

import { initializeLiff } from "../services/liff";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    initializeLiff().catch((error) => {
      console.error("LIFF initialization failed:", error);
    });
  }, []);

  return (
    <div className="route-motion" key={router.asPath}>
      <Component {...pageProps} />
    </div>
  );
}
