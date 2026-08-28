import type { CSSProperties } from "react";

export default function AdSlot({ id, style }: { id: string; style?: CSSProperties }) {
  // AdSense-ready ad unit placeholder. CLS-safe: fixed min-height.
  // Becomes a live unit once the pub-id in pages/_document.js is set.
  return (
    <div className="ad-slot" style={style} aria-hidden="true">
      {/* 
      <ins className="adsbygoogle"
           style={{ display: "block" }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot={id}
           data-ad-format="auto"
           data-full-width-responsive="true" />
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      */}
      <span className="ad-label">ADVERTISEMENT</span>
    </div>
  );
}
