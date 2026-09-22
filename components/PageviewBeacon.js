// components/PageviewBeacon.js — fires a pageview to /api/px.
//
// Mounted once in pages/_app.js so it covers every route, including the
// programmatic /[tool]/[...segments] pages that were being built twice.
//
// Design notes:
//  * sendBeacon, not fetch: it survives the page being closed or navigated
//    away from, which is exactly when a reader leaves and exactly when the
//    pageview matters most.
//  * no cookies, no ids, no PII. See app/api/px/route.ts for the privacy
//    boundary. Do not add a visitor id here without adding a disclosure.
//  * never throws and never blocks render. If measurement is broken the page
//    must still work — measurement is the tail, not the dog.
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PageviewBeacon() {
  const router = useRouter();

  useEffect(() => {
    const send = (kind, extra) => {
      try {
        if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
        const payload = JSON.stringify({
          kind,
          path: window.location.pathname + window.location.search,
          ref: document.referrer || "",
          ...extra,
        });
        navigator.sendBeacon("/api/px", new Blob([payload], { type: "application/json" }));
      } catch {
        /* measurement must never break the page */
      }
    };

    send("pageview");

    // SPA navigations do not fire a page load, so a client-side route change
    // would otherwise be invisible — which is how a single-page site ends up
    // reporting one pageview per visitor.
    const onRoute = (url) => send("pageview", { path: url });
    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
  }, [router.events]);

  return null;
}
