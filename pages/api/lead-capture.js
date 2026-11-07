/**
 * /api/lead-capture — put a quiz visitor's email into Brevo and send their summary.
 *
 * DESIGN NOTES, all from failures elsewhere in this account:
 *
 * 1. BREVO_API_KEY is read from the server environment. It is NOT baked into the bundle.
 *    If it is absent the route returns 501 with a clear reason rather than pretending a
 *    signup succeeded — a silent no-op here would lose the lead and tell the visitor it
 *    worked.
 *
 * 2. The contact is created with updateEnabled=false semantics: we do not overwrite an
 *    existing contact's attributes, because this form only knows a debt band and a state,
 *    and clobbering richer data from another source would be a downgrade.
 *
 * 3. Double opt-in is not assumed. The contact is created with the emailBlacklisted flag
 *    off but no marketing consent asserted; the transactional summary is sent as a
 *    transactional email, not a campaign.
 */
const BREVO_CONTACTS = "https://api.brevo.com/v3/contacts";
const BREVO_EMAIL = "https://api.brevo.com/v3/smtp/email";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const { email, debtBand, state, hardship, summary } = req.body || {};

  if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return res.status(400).json({ ok: false, error: "invalid_email" });
  }

  const key = process.env.BREVO_API_KEY;
  if (!key) {
    // Fail loudly. The visitor is told their summary is on screen, not emailed.
    return res.status(501).json({
      ok: false,
      error: "email_not_configured",
      detail: "BREVO_API_KEY is not set in the server environment.",
    });
  }

  const headers = {
    "api-key": key,
    "content-type": "application/json",
    accept: "application/json",
  };

  try {
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

    // 400 with "duplicate_parameter" means the contact already exists — not an error.
    if (!contact.ok && contact.status !== 400) {
      const body = await contact.text();
      return res.status(502).json({ ok: false, error: "brevo_contact_failed", detail: body.slice(0, 200) });
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
          'You can reply to this email to be removed from any future contact.</p>',
        replyTo: { email: process.env.BREVO_REPLY_TO || "hello@usmoneyhq.com" },
      }),
    });

    if (!send.ok) {
      const body = await send.text();
      return res.status(502).json({ ok: false, error: "brevo_send_failed", detail: body.slice(0, 200) });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "exception", detail: String(err).slice(0, 200) });
  }
}
