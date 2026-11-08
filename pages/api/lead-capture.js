/**
 * /api/lead-capture — Brevo signup + transactional summary.
 *
 * HARDENED AFTER A 502. The previous version crashed the Node worker when the header value
 * was malformed (a trailing newline in BREVO_API_KEY is enough: undici throws on header
 * construction, and an uncaught throw mid-request makes the proxy return its own 502 with no
 * JSON at all). Two changes make that impossible:
 *
 *   1. the key is trimmed and stripped of surrounding quotes before it is used;
 *   2. the whole handler body sits inside a try/catch that always answers in JSON and never
 *      rethrows, so a failure is diagnosable from the response instead of from the proxy.
 */
const BREVO_CONTACTS = "https://api.brevo.com/v3/contacts";
const BREVO_EMAIL = "https://api.brevo.com/v3/smtp/email";

export default async function handler(req, res) {
  let key = "";
  try {
    key = String(process.env.BREVO_API_KEY || "")
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const { email, debtBand, state, hardship, summary } = req.body || {};
    if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
      return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    if (!key) {
      return res.status(501).json({ ok: false, error: "email_not_configured" });
    }
    // A Brevo key is 89 chars starting xkeysib-. Anything else is a wiring fault, and it is
    // better to say so than to send a malformed header and let undici throw.
    if (!/^xkeysib-[A-Za-z0-9]{20,}$/.test(key)) {
      return res.status(500).json({
        ok: false,
        error: "bad_key_shape",
        detail: "BREVO_API_KEY is present but not in the expected xkeysib- form",
        keyLen: key.length,
        keyPrefix: key.slice(0, 8),
      });
    }

    const headers = { "api-key": key, "content-type": "application/json", accept: "application/json" };

    const contact = await fetch(BREVO_CONTACTS, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        attributes: {
          DEBT_BAND: debtBand || "",
          STATE_CODE: state || "",
          HARDSHIP: hardship || "",
          SOURCE: "quiz-debt-relief-check",
        },
        updateEnabled: true,
        listIds: process.env.BREVO_LIST_ID ? [Number(process.env.BREVO_LIST_ID)] : undefined,
      }),
    });

    // duplicate_parameter (400) means the contact exists — not a failure.
    if (!contact.ok && contact.status !== 400) {
      const body = await contact.text();
      return res.status(502).json({ ok: false, error: "brevo_contact_failed", detail: body.slice(0, 300) });
    }

    const send = await fetch(BREVO_EMAIL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sender: { name: "US Money HQ", email: process.env.BREVO_SENDER || "hello@usmoneyhq.com" },
        to: [{ email }],
        subject: "Your debt payoff summary",
        htmlContent:
          '<p>Here is the summary you requested.</p><pre style="font-family:inherit;white-space:pre-wrap">' +
          String(summary || "").slice(0, 4000).replace(/[<>]/g, "") +
          '</pre><p style="font-size:12px;color:#666">US Money HQ. Not financial advice. ' +
          "Reply to this email to be removed from any future contact.</p>",
        replyTo: { email: process.env.BREVO_REPLY_TO || "hello@usmoneyhq.com" },
      }),
    });

    if (!send.ok) {
      const body = await send.text();
      return res.status(502).json({ ok: false, error: "brevo_send_failed", detail: body.slice(0, 300) });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    // Never rethrow: an uncaught throw here is what produced a bare 502 from the proxy.
    return res.status(500).json({
      ok: false,
      error: "capture_exception",
      detail: String((err && err.message) || err).slice(0, 300),
      keyLen: key.length,
      keyPrefix: key.slice(0, 8),
    });
  }
}
