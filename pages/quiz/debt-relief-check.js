import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { AFFILIATE_OFFERS, SITE_URL } from "../../lib/affiliates";

/**
 * /quiz/debt-relief-check — 4-step qualification quiz, routes on the answer.
 *
 * Why a quiz and not another calculator: a calculator visitor wants arithmetic, a quiz
 * visitor wants a decision. The debt amount is the routing key, and it is the only
 * question that changes the destination:
 *   $10,000+    → debt relief (National Debt Relief, $40-120 per qualified call)
 *   under $10k  → consolidation / balance transfer (LendingClub, $50-150 funded)
 *
 * Route targets come from the offer registry at build time. A dormant offer renders no
 * link, so the quiz falls back to the payoff calculator rather than sending a visitor to
 * a 404 — the same rule the /go/ handler enforces.
 */
export default function DebtReliefQuiz({ highUrl, lowUrl, highLive, lowLive }) {
  const [step, setStep] = useState(0);
  const [debt, setDebt] = useState(null);
  const [type, setType] = useState(null);
  const [state, setState] = useState("");
  const [hardship, setHardship] = useState(null);
  const [email, setEmail] = useState("");
  const [sendState, setSendState] = useState(null);

  const steps = [
    {
      q: "How much unsecured debt do you have in total?",
      hint: "Credit cards, personal loans, medical bills — not a mortgage or car loan.",
      options: [
        ["Under $10,000", "low"],
        ["$10,000 – $25,000", "high"],
        ["$25,000 – $50,000", "high"],
        ["More than $50,000", "high"],
      ],
      pick: (v) => setDebt(v),
    },
    {
      q: "What kind of debt is it mostly?",
      options: [
        ["Credit cards", "cc"],
        ["Personal loans", "pl"],
        ["Medical bills", "med"],
        ["A mix of these", "mix"],
      ],
      pick: (v) => setType(v),
    },
    {
      q: "Which state do you live in?",
      options: [
        ["Texas", "TX"], ["California", "CA"], ["Florida", "FL"], ["New York", "NY"],
        ["Illinois", "IL"], ["Ohio", "OH"], ["Georgia", "GA"], ["North Carolina", "NC"],
        ["Other state", "OT"],
      ],
      pick: (v) => setState(v),
    },
    {
      q: "Are you currently behind on any payment?",
      options: [["Yes, one or more", "yes"], ["No, but I am struggling", "near"], ["No", "no"]],
      pick: (v) => setHardship(v),
    },
  ];

  const answer = (val) => {
    steps[step].pick(val);
    setStep(step + 1);
  };

  const done = step >= steps.length;
  const high = debt === "high";
  const target = high ? highUrl : lowUrl;
  const live = high ? highLive : lowLive;

  return (
    <>
      <Head>
        <title>Debt Relief Check 2026 — Do You Qualify? | US Money HQ</title>
        <meta
          name="description"
          content="Answer four questions to see which 2026 debt option fits your balance: a debt relief program for $10,000 or more, or a consolidation loan below that."
        />
        <link rel="canonical" href={SITE_URL + "/quiz/debt-relief-check"} />
      </Head>

      <main className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-xs uppercase tracking-widest text-emerald-700">
          Debt relief eligibility · 2026
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          See which debt option actually fits your balance
        </h1>
        <p className="mt-3 text-slate-600">
          Four questions. No email required, nothing sent anywhere. The answer depends mostly on
          one number — how much unsecured debt you are carrying.
        </p>

        {!done && (
          <div className="mt-8 rounded-xl border border-slate-200 p-6">
            <p className="text-xs text-slate-500">
              Question {step + 1} of {steps.length}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{steps[step].q}</h2>
            {steps[step].hint && (
              <p className="mt-1 text-sm text-slate-500">{steps[step].hint}</p>
            )}
            <div className="mt-5 space-y-2">
              {steps[step].options.map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => answer(val)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-left hover:border-emerald-600 hover:bg-emerald-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {done && (
          <div className="mt-8 rounded-xl border border-emerald-700 bg-emerald-50 p-6">
            <h2 className="text-lg font-semibold">
              {high ? "A debt relief program is the usual fit" : "Consolidation is the usual fit"}
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              {high
                ? "At $10,000 or more in unsecured debt, a negotiated settlement program can reduce the balance itself. It damages credit and is not a loan, so it only makes sense when the balance is large relative to income."
                : "Below $10,000, settlement programs rarely beat their own fees. A consolidation loan or a 0% balance transfer usually costs less and does not touch your credit score the way a settlement does."}
            </p>
            {hardship === "yes" && (
              <p className="mt-3 text-sm text-slate-700">
                Being behind on a payment changes the order: talk to a nonprofit credit counsellor
                before signing anything with a fee attached.
              </p>
            )}

            <div className="mt-5 space-y-3">
              {target ? (
                <a
                  href={target}
                  className="block rounded-lg bg-emerald-800 px-4 py-3 text-center font-medium text-white"
                  rel="nofollow sponsored noopener"
                >
                  {high ? "Check your debt relief eligibility" : "Check your consolidation rate"}
                </a>
              ) : (
                <Link
                  href={high ? "/debt-payoff-calculator" : "/credit-card-payoff-calculator"}
                  className="block rounded-lg bg-emerald-800 px-4 py-3 text-center font-medium text-white"
                >
                  {high
                    ? "Model your payoff timeline first"
                    : "Compare payoff dates for your balance"}
                </Link>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSendState("sending");
                  const summary = [
                    "Debt band: " + (high ? "$10,000 or more" : "under $10,000"),
                    "State: " + state,
                    "Behind on a payment: " + hardship,
                    high
                      ? "Usual fit: a negotiated settlement program. It reduces the balance and damages credit; it is not a loan."
                      : "Usual fit: consolidation or a balance transfer. Settlement fees usually exceed the saving below $10,000.",
                    "Model your timeline: usmoneyhq.com/debt-payoff-calculator",
                  ].join("\n");
                  try {
                    const r = await fetch("/api/lead-capture", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ email, debtBand: high ? "10k_plus" : "under_10k", state, hardship, summary }),
                    });
                    const j = await r.json();
                    setSendState(j.ok ? "sent" : j.error === "email_not_configured" ? "unconfigured" : "failed");
                  } catch {
                    setSendState("failed");
                  }
                }}
                className="mt-4 rounded-lg border border-slate-300 p-4"
              >
                <label className="block text-sm font-medium text-slate-800" htmlFor="email">
                  Email me this summary
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  One email, no sequence. We do not sell addresses.
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white"
                  >
                    {sendState === "sending" ? "Sending…" : "Send"}
                  </button>
                </div>
                {sendState === "sent" && (
                  <p className="mt-2 text-xs text-emerald-700">Sent. Check your inbox.</p>
                )}
                {sendState === "unconfigured" && (
                  <p className="mt-2 text-xs text-amber-700">
                    Email delivery is not configured yet — your summary is above.
                  </p>
                )}
                {sendState === "failed" && (
                  <p className="mt-2 text-xs text-red-700">
                    That did not send. Your summary is above; try again later.
                  </p>
                )}
              </form>

              <p className="text-xs text-slate-500">
                {live
                  ? "We may earn a commission if you apply through this link. It does not change what you pay."
                  : "No partner link is live for this path yet, so this opens our own calculator instead."}
              </p>
            </div>
          </div>
        )}

        <section className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-800">How this is decided</h2>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2">Balance</th>
                <th className="py-2">Usual fit</th>
                <th className="py-2">Why</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2">Under $10,000</td>
                <td className="py-2">Consolidation / balance transfer</td>
                <td className="py-2">Settlement fees exceed the saving</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2">$10,000 – $50,000</td>
                <td className="py-2">Negotiated settlement</td>
                <td className="py-2">Balance reduction outweighs credit damage</td>
              </tr>
              <tr>
                <td className="py-2">$50,000+</td>
                <td className="py-2">Settlement, or bankruptcy advice</td>
                <td className="py-2">At this level a lawyer is often cheaper</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-xs text-slate-500">
            Operational information, not legal or financial advice. Reviewed against publicly
            available program terms on 3 November 2026.
          </p>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const find = (id) => AFFILIATE_OFFERS.find((o) => o.id === id);
  const hi = find("national-debt-relief");
  const lo = find("lendingclub-loan");
  return {
    props: {
      highLive: Boolean(hi && hi.live),
      lowLive: Boolean(lo && lo.live),
      highUrl: hi && hi.live ? `/go/${hi.id}?src=quiz-debt-relief` : null,
      lowUrl: lo && lo.live ? `/go/${lo.id}?src=quiz-debt-relief` : null,
    },
  };
}
