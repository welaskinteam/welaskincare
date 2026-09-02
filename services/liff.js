let liffInitPromise = null;

export function initializeLiff() {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  if (!liffId) {
    return Promise.resolve(null);
  }

  if (!liffInitPromise) {
    liffInitPromise = import("@line/liff")
      .then(({ default: liff }) =>
        liff.init({
          liffId,
          withLoginOnExternalBrowser: false,
        }).then(() => liff),
      )
      .catch((error) => {
        liffInitPromise = null;
        throw error;
      });
  }

  return liffInitPromise;
}
