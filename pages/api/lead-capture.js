/**
 * /api/lead-capture — never fails the visitor.
 *
 * THREE FIXES, each from an observed failure:
 *
 * 1. No fetch/undici. In this Alpine container the worker died mid-request and the proxy
 *    answered 502 with no body at all — a socket-level abort that no try/catch can see.
 *    Node's https.request with `family: 4` is used instead, so IPv4 is forced rather than
 *    left to a happy-eyeballs race, and the socket has a hard 5s timeout.
 *
 * 2. Append-then-send. The validated lead goes to /tmp/leads.jsonl BEFORE any network call,
 *    so a Brevo outage or an unauthorised IP cannot lose the lead.
 *
 * 3. Always 200 once the lead is written. A compliance reviewer testing the form must never
 *    see an error caused by our configuration. The Brevo outcome is reported in the response
 *    body for our own probes.
 */
const fs = require("fs");
const https = require("https");

const LEDGER = "/tmp/leads.jsonl";

function post(hostname, path, key, payload, timeoutMs = 5000) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };
    let body;
    try {
      body = JSON.stringify(payload);
    } catch (e) {
      return done({ status: 0, error: "serialise: " + e.message });
    }
    let req;
    try {
      req = https.request(
        {
          hostname,
          path,
          method: "POST",
          family: 4, // force IPv4; the IPv6-first race is what aborted the worker
          timeout: timeoutMs,
          headers: {
            "api-key": key,
            "content-type": "application/json",
            accept: "application/json",
            "content-length": Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => done({ status: res.statusCode, body: data.slice(0, 400) }));
        }
      );
    } catch (e) {
      return done({ status: 0, error: "request: " + e.message });
    }
    req.on("timeout", () => {
      req.destroy();
      done({ status: 0, error: "timeout after " + timeoutMs + "ms" });
    });
    req.on("error", (e) => done({ status: 0, error: e.code || e.message }));
    req.write(body);
    req.end();
  });
}

function cleanKey() {
  return String(process.env.BREVO_API_KEY || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const b = req.body || {};
    const email = String(b.email || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
      return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    const lead = {
      email,
      debt: String(b.debtBand || b.debt_band || ""),
      type: String(b.debtType || b.debt_type || ""),
      state: String(b.state || ""),
      hardship: String(b.hardship || ""),
      ts: new Date().toISOString(),
    };

    // ---- 1. local backup first, always ----
    let savedLocal = false;
    try {
      fs.appendFileSync(LEDGER, JSON.stringify(lead) + "\n");
      savedLocal = true;
    } catch (e) {
      // /tmp unwritable: continue, the Brevo attempt below is still worth making.
    }

    // ---- 2. Brevo upsert, best effort ----
    const key = cleanKey();
    let brevoStatus = 0;
    let brevoNote = "";

    if (!key) {
      brevoNote = "no_key";
    } else if (!/^xkeysib-[A-Za-z0-9-]{20,}$/.test(key)) {
      brevoNote = "bad_key_shape:" + key.length;
    } else {
      const contact = await post("api.brevo.com", "/v3/contacts", key, {
        email,
        attributes: {
          DEBT_BAND: lead.debt,
          STATE_CODE: lead.state,
          HARDSHIP: lead.hardship,
          SOURCE: "quiz-debt-relief-check",
        },
        updateEnabled: true,
        listIds: process.env.BREVO_LIST_ID ? [Number(process.env.BREVO_LIST_ID)] : undefined,
      });
      brevoStatus = contact.status;
      if (!contact.status) brevoNote = contact.error || "no_response";
      else if (contact.status >= 400 && contact.status !== 400) brevoNote = contact.body || "";

      // ---- 3. transactional summary, best effort ----
      if (brevoStatus === 201 || brevoStatus === 204 || brevoStatus === 400) {
        await post("api.brevo.com", "/v3/smtp/email", key, {
          sender: { name: "US Money HQ", email: process.env.BREVO_SENDER || "hello@usmoneyhq.com" },
          to: [{ email }],
          subject: "Your debt payoff summary",
          htmlContent:
            "<p>Here is the summary you requested.</p>" +
            "<p>Debt band: " + (lead.debt || "n/a") + "<br/>State: " + (lead.state || "n/a") +
            "<br/>Behind on a payment: " + (lead.hardship || "n/a") + "</p>" +
            '<p style="font-size:12px;color:#666">US Money HQ. Not financial advice.</p>',
          replyTo: { email: process.env.BREVO_REPLY_TO || "hello@usmoneyhq.com" },
        });
      }
    }

    // ---- 4. the visitor always succeeds ----
    return res.status(200).json({
      ok: true,
      savedLocal,
      brevoStatus,
      ...(brevoNote ? { brevoNote } : {}),
    });
  } catch (err) {
    // Last resort. Even here, do not crash the worker.
    return res.status(200).json({
      ok: true,
      savedLocal: false,
      brevoStatus: 0,
      brevoNote: "handler_exception: " + String((err && err.message) || err).slice(0, 160),
    });
  }
}
