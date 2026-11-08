/**
 * /api/lead-capture — capture first, email second.
 *
 * THE DESIGN RULE: a saved lead is a success. Email delivery is a bonus. This route returns
 * 200 {ok:true, captured:true} the moment Brevo has the contact, whether or not the
 * transactional summary goes out. Only a failure to capture returns a non-200.
 *
 * Why: a compliance reviewer or a visitor testing the form should never see an error because
 * a sender address is unverified or an IP is unauthorised. Those are configuration faults on
 * our side, and they must not look like a broken form.
 *
 * HARDENING, after a bare 502 with no JSON body: the key is trimmed and unquoted, and the
 * whole body sits in a catch that always answers in JSON. An uncaught throw inside a Node
 * worker is what produces a proxy 502 instead of a response.
 */
const CONTACTS = "https://api.brevo.com/v3/contacts";
const SEND = "https://api.brevo.com/v3/smtp/email";

function cleanKey() {
  return String(process.env.BREVO_API_KEY || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

export default async function handler(req, res) {
  let key = "";
  try {
    key = cleanKey();

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const body = req.body || {};
    // Accept JSON body or urlencoded form, so the form works whichever way it is posted.
    const email = String(body.email || "").trim();
    const debtBand = String(body.debtBand || body.debt_band || "");
    const state = String(body.state || "");
    const hardship = String(body.hardship || "");
    const summary = String(body.summary || "");

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
      return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    if (!key) {
      // Nothing to store the lead in. Say so plainly rather than accepting and dropping it.
      return res.status(501).json({ ok: false, error: "email_not_configured" });
    }
    if (!/^xkeysib-[A-Za-z0-9-]{20,}$/.test(key)) {
      return res.status(500).json({
        ok: false,
        error: "bad_key_shape",
        keyLen: key.length,
        keyPrefix: key.slice(0, 8),
      });
    }

    const headers = {
      "api-key": key,
      "content-type": "application/json",
      accept: "application/json",
    };

    // ---- 1. capture. This is the part that must succeed. ----
    let captured = false;
    let captureDetail = "";
    try {
      const r = await fetch(CONTACTS, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          attributes: {
            DEBT_BAND: debtBand,
            STATE_CODE: state,
            HARDSHIP: hardship,
            SOURCE: "quiz-debt-relief-check",
          },
          updateEnabled: true,
          listIds: process.env.BREVO_LIST_ID ? [Number(process.env.BREVO_LIST_ID)] : undefined,
        }),
      });
      const text = await r.text();
      // Brevo answers 400 duplicate_parameter when the contact exists; that is a success here.
      captured = r.ok || r.status === 400;
      if (!captured) captureDetail = "HTTP " + r.status + " " + text.slice(0, 200);
    } catch (e) {
      captureDetail = "fetch failed: " + String((e && e.message) || e).slice(0, 200);
    }

    if (!captured) {
      // Never a crash, always JSON, always with the reason.
      return res.status(502).json({ ok: false, error: "capture_failed", detail: captureDetail });
    }

    // ---- 2. email. Best effort; its failure does not fail the request. ----
    let emailed = false;
    let emailDetail = "";
    try {
      const sender = process.env.BREVO_SENDER || "hello@usmoneyhq.com";
      const r = await fetch(SEND, {
        method: "POST",
        headers,
        body: JSON.stringify({
          sender: { name: "US Money HQ", email: sender },
          to: [{ email }],
          subject: "Your debt payoff summary",
          htmlContent:
            '<p>Here is the summary you requested.</p><pre style="font-family:inherit;white-space:pre-wrap">' +
            summary.slice(0, 4000).replace(/[<>]/g, "") +
            '</pre><p style="font-size:12px;color:#666">US Money HQ. Not financial advice. ' +
            "Reply to this email to be removed from any future contact.</p>",
          replyTo: { email: process.env.BREVO_REPLY_TO || sender },
        }),
      });
      const text = await r.text();
      emailed = r.ok;
      if (!emailed) emailDetail = "HTTP " + r.status + " " + text.slice(0, 200);
    } catch (e) {
      emailDetail = "fetch failed: " + String((e && e.message) || e).slice(0, 200);
    }

    return res.status(200).json({
      ok: true,
      captured: true,
      emailed,
      ...(emailed ? {} : { email_status: emailDetail }),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "capture_exception",
      detail: String((err && err.message) || err).slice(0, 300),
      keyLen: key.length,
      keyPrefix: key.slice(0, 8),
    });
  }
}
