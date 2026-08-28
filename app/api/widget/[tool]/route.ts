import { NextRequest, NextResponse } from "next/server";
import { getTool, SITE_URL } from "@/lib/tools";

/**
 * Widget API — /api/widget/[tool]
 * Returns { html, js } for an embeddable, self-contained calculator widget.
 * Used by /widget-loader.js on any third-party site. CORS-open by design
 * (public data; the backlink in the widget footer is the value).
 */

const esc = (s: string | number): string =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function fieldHtml(f: any): string {
  if (f.type === "select") {
    const opts = f.options
      .map(
        (o: any) =>
          `<option value="${esc(o.value)}"${String(o.value) === String(f.default) ? " selected" : ""}>${esc(o.label)}</option>`
      )
      .join("");
    return `<div class="umhq-field"><label for="umhq-${esc(f.key)}">${esc(f.label)}</label><select id="umhq-${esc(f.key)}" data-key="${esc(f.key)}">${opts}</select></div>`;
  }
  const prefix = f.prefix ? `<span class="umhq-prefix">${esc(f.prefix)}</span>` : "";
  return `<div class="umhq-field"><label for="umhq-${esc(f.key)}">${esc(f.label)}</label><div class="umhq-inputwrap">${prefix}<input type="number" id="umhq-${esc(f.key)}" data-key="${esc(f.key)}" value="${esc(f.default)}" min="${esc(f.min ?? "")}" max="${esc(f.max ?? "")}" step="${esc(f.step ?? "any")}" inputmode="${esc(f.inputMode ?? "decimal")}" /></div></div>`;
}

export async function GET(_req: NextRequest, { params }: { params: { tool: string } }) {
  const tool = getTool(params.tool);
  if (!tool) return NextResponse.json({ error: "unknown tool" }, { status: 404 });

  const fields = tool.fields.map(fieldHtml).join("");
  const slug = tool.slug;

  const html = `<div class="umhq-widget" data-tool="${esc(slug)}">
  <style>
    .umhq-widget{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:100%;box-sizing:border-box;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;color:#111827;line-height:1.45}
    .umhq-widget *,.umhq-widget *::before,.umhq-widget *::after{box-sizing:border-box}
    .umhq-widget h3{margin:0 0 12px;font-size:17px;font-weight:700;color:#0f172a}
    .umhq-field{margin-bottom:10px}
    .umhq-field label{display:block;font-size:12.5px;font-weight:600;color:#374151;margin-bottom:4px}
    .umhq-inputwrap{display:flex;align-items:center}
    .umhq-prefix{background:#f3f4f6;border:1px solid #d1d5db;border-right:0;padding:7px 9px;border-radius:8px 0 0 8px;font-size:13px;color:#374151;line-height:1.2}
    .umhq-widget input[type=number],.umhq-widget select{width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;color:#111827;background:#fff;appearance:auto}
    .umhq-inputwrap input{border-radius:0 8px 8px 0}
    .umhq-widget select{appearance:auto}
    .umhq-widget input:focus,.umhq-widget select:focus{outline:2px solid #2563eb;outline-offset:1px;border-color:#2563eb}
    .umhq-actions{display:flex;gap:8px;margin-top:12px}
    .umhq-btn{flex:1;border:0;border-radius:8px;padding:9px 12px;font-size:14px;font-weight:600;cursor:pointer}
    .umhq-btn-calc{background:#2563eb;color:#fff}
    .umhq-btn-calc:hover{background:#1d4ed8}
    .umhq-btn-clear{background:#f3f4f6;color:#374151}
    .umhq-btn-clear:hover{background:#e5e7eb}
    .umhq-results{margin-top:14px;border-top:1px solid #e5e7eb;padding-top:10px;display:none}
    .umhq-results.show{display:block}
    .umhq-row{display:flex;justify-content:space-between;padding:5px 0;font-size:14px;color:#374151}
    .umhq-row.highlight{font-weight:700;color:#0f172a;border-top:1px solid #e5e7eb;margin-top:4px;padding-top:8px}
    .umhq-row .umhq-val{font-variant-numeric:tabular-nums}
    .umhq-foot{margin-top:12px;padding-top:8px;border-top:1px dashed #e5e7eb;text-align:right}
    .umhq-foot a{font-size:11px;color:#6b7280;text-decoration:none}
    .umhq-foot a:hover{color:#2563eb;text-decoration:underline}
    .umhq-err{color:#dc2626;font-size:13px;margin-top:10px;display:none}
  </style>
  <h3>${esc(tool.h1)}</h3>
  <form class="umhq-form" onsubmit="return false">${fields}
    <div class="umhq-actions">
      <button type="submit" class="umhq-btn umhq-btn-calc">Calculate</button>
      <button type="button" class="umhq-btn umhq-btn-clear">Reset</button>
    </div>
  </form>
  <div class="umhq-err" role="alert"></div>
  <div class="umhq-results" aria-live="polite"></div>
  <div class="umhq-foot"><a href="${SITE_URL}/${esc(slug)}" target="_blank" rel="noopener nofollow">Powered by US Money HQ — free ${esc(tool.shortTitle)}</a></div>
</div>`;

  const js = `(function(){
  var root=document.currentScript&&document.currentScript.parentElement;
  if(!root)return;
  var form=root.querySelector('.umhq-form'),res=root.querySelector('.umhq-results'),err=root.querySelector('.umhq-err');
  var defaults={};
  root.querySelectorAll('[data-key]').forEach(function(el){defaults[el.getAttribute('data-key')]=el.value;});
  function read(){var v={};root.querySelectorAll('[data-key]').forEach(function(el){v[el.getAttribute('data-key')]=el.value});return v;}
  function reset(){root.querySelectorAll('[data-key]').forEach(function(el){el.value=defaults[el.getAttribute('data-key')];});res.classList.remove('show');err.style.display='none';}
  form.addEventListener('submit',function(e){e.preventDefault();
    err.style.display='none';
    fetch('${SITE_URL}/api/calc/${esc(slug)}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(read())})
    .then(function(r){if(!r.ok)throw new Error('calc failed');return r.json();})
    .then(function(d){res.innerHTML='';d.results.forEach(function(row){var div=document.createElement('div');div.className='umhq-row'+(row.highlight?' highlight':'');div.innerHTML='<span>'+row.label+'</span><span class="umhq-val">'+row.value+'</span>';res.appendChild(div);});res.classList.add('show');})
    .catch(function(){err.textContent='Calculation error. Please check your numbers.';err.style.display='block';});
  });
  root.querySelector('.umhq-btn-clear').addEventListener('click',reset);
})();`;

  // Runtime guard: never ship a widget whose JS can't parse (template-literal escaping bugs).
  try {
    new Function(js);
  } catch (e) {
    return NextResponse.json({ error: `widget js invalid: ${(e as Error).message}` }, { status: 500 });
  }

  const res = NextResponse.json({ html, js, slug, title: tool.title });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Cache-Control", "public, max-age=3600");
  return res;
}