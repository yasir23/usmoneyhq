import { useEffect } from "react";
import { ADSENSE_PUB_ID, ADSENSE_ACTIVE } from "../lib/ads";

/**
 * AdSense ad unit. Auto-activates when lib/ads.ts has a real publisher ID.
 * CLS-safe: fixed min-height container. Pushes the unit on mount so multiple
 * slots per page all render (loader queues pushes until adsbygoogle.js loads).
 */
export default function AdSlot({ id, format = "auto", style }) {
  useEffect(() => {
    if (!ADSENSE_ACTIVE) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // ignore transient AdSense errors — unit still renders on next push
    }
  }, []);

  if (ADSENSE_ACTIVE) {
    return (
      <div className="ad-slot" style={style}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_PUB_ID}
          data-ad-slot={id}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
        <span className="ad-label">ADVERTISEMENT</span>
      </div>
    );
  }

  return (
    <div className="ad-slot" style={style}>
      <span className="ad-label">ADVERTISEMENT</span>
    </div>
  );
}
