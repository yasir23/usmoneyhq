/* US Money HQ — Embeddable Calculator Widget Loader v1
 * Usage:
 *   <div data-umhq-widget="mortgage-calculator"></div>
 *   <script async src="https://usmoneyhq.com/widget-loader.js"></script>
 * Fetches the widget bundle from /api/widget/[tool] and injects it,
 * including a "Powered by US Money HQ" backlink. Handles multiple widgets.
 */
(function () {
  var API = "https://usmoneyhq.com/api/widget";
  var mounted = false;

  function boot() {
    if (mounted) return;
    mounted = true;
    var nodes = document.querySelectorAll("[data-umhq-widget]");
    for (var i = 0; i < nodes.length; i++) {
      loadWidget(nodes[i]);
    }
  }

  function loadWidget(host) {
    var slug = host.getAttribute("data-umhq-widget");
    if (!slug) return;
    var holder = document.createElement("div");
    holder.className = "umhq-host";
    host.appendChild(holder);
    fetch(API + "/" + encodeURIComponent(slug), {
      headers: { Accept: "application/json" },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("widget unavailable");
        return r.json();
      })
      .then(function (bundle) {
        holder.innerHTML = bundle.html;
        var script = document.createElement("script");
        script.textContent = bundle.js;
        holder.appendChild(script);
      })
      .catch(function () {
        holder.innerHTML =
          '<p style="font-size:13px;color:#6b7280;font-family:sans-serif">Calculator unavailable. <a href="https://usmoneyhq.com/' +
          encodeURIComponent(slug) +
          '" target="_blank" rel="noopener nofollow">Use it on US Money HQ</a>.</p>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
