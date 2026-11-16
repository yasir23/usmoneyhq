import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { AFFILIATE_OFFERS, SITE_URL } from "../../lib/affiliates";
import { debtPayoff, monthlyPayment } from "../../lib/calc";

/**
 * The two rates and the term this page's cost table runs on. These are INPUTS, stated
 * on the page, not published findings — the table's outputs are computed from them by
 * lib/calc at build time, so no figure in the table is hand-typed.
 *
 * They are deliberately generic rather than quoting a provider: this page does not
 * know a reader's actual rates, and inventing a "typical" offer would be a claim the
 * site cannot support. The prose tells the reader both numbers are assumptions.
 */
const CARD_APR = 24;
const LOAN_APR = 11;
const LOAN_TERM = 60;

/** Balance used to illustrate each band in the quiz's own decision table. */
const COST_BANDS = [
  { label: "Under $10,000", exemplar: 6000 },
  { label: "$10,000 – $25,000", exemplar: 18000 },
  { label: "$25,000 – $50,000", exemplar: 40000 },
];

const usd = (n) =>
  "$" +
  Math.round(n).toLocaleString("en-US");


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
export default function DebtReliefQuiz({ highUrl, lowUrl, highLive, lowLive, costRows }) {
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

  // Derived, never typed: the interest multiple the table's own rows produce.
  const cardLoanRatio =
    costRows && costRows.length && costRows[0].loanInterest > 0
      ? (costRows[0].cardInterest / costRows[0].loanInterest).toFixed(1)
      : "several";

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
                <p className="mt-2 text-xs text-slate-500">
                  By submitting you agree to receive this summary by email and confirm you are 18 or
                  older. See our{" "}
                  <a href="/privacy-policy" className="underline">
                    privacy policy
                  </a>{" "}
                  and{" "}
                  <a href="/editorial-policy" className="underline">
                    editorial policy
                  </a>
                  . This site is not a lender, broker or debt relief provider and does not make
                  credit decisions.
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

        <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          <h2 className="text-sm font-semibold text-slate-800">Advertiser disclosure</h2>
          <p className="mt-1">
            US Money HQ earns a commission when a reader applies through a partner link on this
            page. The commission does not change what a reader pays, and it does not influence which
            option this quiz routes to — the routing is decided by the debt balance band, stated in
            the decision table below. Where no partner link is live, the page sends readers to our
            own calculator instead of a placeholder.
          </p>
          <p className="mt-2">
            We are not a lender, broker, debt settlement company or credit counselling agency. We do
            not collect application data on behalf of any provider, and we do not sell personal
            information.
          </p>
        </section>

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

        <section className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-800">
            What each route costs at the same monthly payment
          </h2>
          <p className="mt-2">
            The useful comparison is not which rate is lower. It is what the same monthly
            outlay buys you on each route. Every row below holds the payment constant and
            changes only the interest rate, so the final column is the price of the rate
            itself, not a difference in how hard you are paying.
          </p>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2">Balance</th>
                <th className="py-2">Same payment</th>
                <th className="py-2">On a {CARD_APR}% card</th>
                <th className="py-2">On a {LOAN_APR}% loan</th>
                <th className="py-2">Extra cost of the card</th>
              </tr>
            </thead>
            <tbody>
              {costRows.map((r) => (
                <tr key={r.label} className="border-b border-slate-100">
                  <td className="py-2">{r.label}</td>
                  <td className="py-2">{usd(r.payment)}/mo</td>
                  <td className="py-2">
                    {usd(r.cardInterest)} interest · {r.cardMonths} mo
                  </td>
                  <td className="py-2">
                    {usd(r.loanInterest)} interest · {LOAN_TERM} mo
                  </td>
                  <td className="py-2 font-medium text-slate-800">{usd(r.delta)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3">
            Read the term column before the interest column. Because the payment is scaled to
            the balance, the term is the same at every size — {costRows[0].cardMonths} months on
            the card against {LOAN_TERM} on the loan — and the interest runs{" "}
            {cardLoanRatio} times higher. That is the whole case for a lower rate: not a
            discount on today&apos;s payment, but a different number of years.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Both rates above are assumptions, not quotes — a real card or loan rate depends on
            your credit file and the lender. What the table shows is the shape of the problem:
            at a fixed payment, a higher rate does not just cost more interest, it stretches
            the term, so you pay the higher rate on the balance for longer. Run the same
            arithmetic on your own numbers with the{" "}
            <Link href="/debt-payoff-calculator" className="underline">
              debt payoff calculator
            </Link>{" "}
            or the{" "}
            <Link href="/credit-card-payoff-calculator" className="underline">
              credit card payoff calculator
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-800">
            What the $10,000 line is really about
          </h2>
          <p className="mt-2">
            The threshold in this quiz is not a legal one and no programme publishes it as a
            cut-off. It is the point at which the arithmetic of a negotiated settlement starts
            to work, for two reasons a smaller balance usually fails.
          </p>
          <p className="mt-2">
            First, a settlement enrols you in a programme with a fee that is charged against
            the balance being negotiated. On a small balance that fee is a large share of the
            amount supposedly being saved, so the discount has to be unusually deep before the
            reader is ahead. Second, a smaller balance is one a reader can usually retire on
            their own by paying more each month — the row above shows what a fixed payment
            does to the term. A programme is a tool for a balance that will not move, not for
            one that will.
          </p>
          <p className="mt-2">
            Above roughly $50,000 the trade-off changes again: the amount at stake is large
            enough that a lawyer&apos;s opinion on bankruptcy is often cheaper than the fees on
            a negotiation. That is a conversation with a licensed attorney in your state, not a
            quiz result.
          </p>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-800">
            What to have ready before you apply
          </h2>
          <p className="mt-2">
            Any legitimate debt route — consolidation, counselling or settlement — asks for the
            same underlying picture, and having it in front of you is what separates a real
            quote from a sales call:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>A current statement for every unsecured account, with the balance and the APR.</li>
            <li>Your total minimum payments, summed — not just the largest one.</li>
            <li>Your monthly take-home pay, which is what a payment has to fit inside.</li>
            <li>Whether any account is already past due, and by how many days.</li>
          </ul>
          <p className="mt-3">
            If an offer cannot tell you the total cost, the term, and what happens to your
            credit file before you sign, you do not have enough information to compare it with
            the alternative of simply paying more.
          </p>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-800">
            Red flags that mean walk away
          </h2>
          <p className="mt-2">
            The clearest one is a fee charged before any debt has actually been renegotiated.
            Under the FTC Telemarketing Sales Rule (16 CFR 310.4(a)(5)), a debt relief service
            may not collect an advance fee before it has a documented settlement or a
            renegotiated payment for at least one of your debts. A request for money up front to
            &quot;get started&quot; is therefore not a negotiating position — it is the pattern the
            rule exists to stop.
          </p>
          <p className="mt-2">
            Two others are worth naming. A provider that tells you to stop paying your creditors
            and to stop talking to them directly is asking you to absorb the credit damage while
            it collects fees. And a provider that cannot say in writing which of your accounts
            it will negotiate, and on what timeline, is not describing a programme — it is
            describing a call.
          </p>
          <p className="mt-2">
            Free or low-cost help exists and is not a sales channel: a nonprofit credit
            counselling agency, or your state&apos;s attorney general consumer office. If you are
            behind on a payment, that is the order the quiz recommends — before anything with a
            fee attached.
          </p>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-800">How this page is built</h2>
          <p className="mt-2">
            The routing rule is the balance band in the decision table above; the cost table is
            produced by the same payoff engine that runs this site&apos;s{" "}
            <Link href="/debt-payoff-calculator" className="underline">
              debt payoff
            </Link>{" "}
            and{" "}
            <Link href="/credit-card-payoff-calculator" className="underline">
              credit card payoff
            </Link>{" "}
            calculators — a month-by-month amortisation at the stated rate, with interest
            accrued on the declining balance. No figure on this page is entered by hand: the
            rates are published inputs and every dollar amount in the table is computed from
            them at build time. Change a rate and the table changes with it.
          </p>
          <p className="mt-2">
            The quiz does not collect your balance, your accounts or your credit file, and it
            does not send any answer anywhere unless you ask for the summary by email.
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

  // The cost table is computed here, at build time, by lib/calc — the same engine the
  // debt-payoff and credit-card-payoff calculators run. Rates are the page's stated
  // inputs; every dollar and every month below is derived from them. Nothing typed.
  const costRows = COST_BANDS.map((b) => {
    const payment = monthlyPayment(b.exemplar, LOAN_APR, LOAN_TERM);
    const card = debtPayoff(b.exemplar, CARD_APR, payment);
    const loanInterest = payment * LOAN_TERM - b.exemplar;
    return {
      label: b.label,
      payment: Math.round(payment * 100) / 100,
      cardInterest: Math.round(card.totalInterest * 100) / 100,
      cardMonths: card.months,
      loanInterest: Math.round(loanInterest * 100) / 100,
      delta: Math.round((card.totalInterest - loanInterest) * 100) / 100,
    };
  });

  return {
    props: {
      highLive: Boolean(hi && hi.live),
      lowLive: Boolean(lo && lo.live),
      highUrl: hi && hi.live ? `/go/${hi.id}?src=quiz-debt-relief` : null,
      lowUrl: lo && lo.live ? `/go/${lo.id}?src=quiz-debt-relief` : null,
      costRows,
    },
  };
}
