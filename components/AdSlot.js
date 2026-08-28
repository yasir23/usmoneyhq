export default function AdSlot({ id, format = "auto", style }) {
  // AdSense-ready ad unit placeholder.
  // Becomes a live unit automatically once the pub-id in _document.js is set.
  return (
    <div className="ad-slot" style={style}>
      {/* 
      <ins className="adsbygoogle"
           style={{ display: "block" }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot={id}
           data-ad-format={format}
           data-full-width-responsive="true" />
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      */}
      <span className="ad-label">ADVERTISEMENT</span>
    </div>
  );
}
