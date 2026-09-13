import { useEffect } from "react";
import { ADSENSE_PUB_ID, ADSENSE_ACTIVE, resolveAdUnit } from "../lib/ads";

/**
 * AdSense ad unit.
 *
 * `id` is a DESCRIPTIVE slot name ("mortgage-calculator-top", "blog-x-mid").
 * AdSense requires the NUMERIC id of an ad unit created in the dashboard, so the
 * name is mapped through AD_UNITS (lib/ads.ts) by its trailing position token
 * (top / mid / bottom / compare). One numeric unit per position covers every
 * page — ad units are site-wide, not per-URL.
 *
 * When no numeric id is configured we render NOTHING. An <ins> carrying a
 * non-numeric data-ad-slot matches no ad unit, so it can never fill: it is a
 * dead slot that only emits a console error per push(). Rendering nothing is the
 * honest state, and Auto ads fill the placement when enabled.
 *
 * CLS-safe: the container keeps its reserved space whenever a real unit renders.
 */
export default function AdSlot({ id, format = "auto", style }) {
  const unit = ADSENSE_ACTIVE ? resolveAdUnit(id) : "";

  useEffect(() => {
    if (!unit) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // ignore transient AdSense errors — unit still renders on next push
    }
  }, [unit]);

  if (!unit) return null;

  return (
    <div className="ad-slot" style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_PUB_ID}
        data-ad-slot={unit}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <span className="ad-label">ADVERTISEMENT</span>
    </div>
  );
}
