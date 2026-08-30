import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";

/** Guide: health & fitness basics — cornerstone content with embedded calculator. */
export default function HealthFitnessGuide() {
  const tool = getTool("tdee-calculator");
  return (
    <>
      <Head>
        <title>Health & Fitness Guide 2026 — TDEE, BMI & Hydration | US Money HQ</title>
        <meta name="description" content="The numbers that matter for health in 2026: calories, BMI, body fat, water intake, and sleep — with free calculators." />
        <link rel="canonical" href={`${SITE_URL}/guides/health-fitness-guide`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "Health and Fitness Guide 2026", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-30" }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>Health & Fitness</span></nav>
        <h1>The Numbers That Matter for Your Health</h1>
        <p className="sub">Calories in, calories out — and the tools to know both sides.</p>

        <AdSlot id="guide-health-top" />

        <div className="seo">
          <h2>TDEE: your personal calorie budget</h2>
          <p>Your Total Daily Energy Expenditure is what your body burns in a day. Eat at TDEE to maintain, 500 under to lose about 1 lb/week, 300-500 over (with training) to build muscle.</p>
          <h2>BMI is a starting point, not a verdict</h2>
          <p>BMI is cheap and useful at population level, but ignores muscle mass — a fit athlete can land in "overweight." Pair it with body fat percentage (the US Navy method is accurate within ~3%) for the real picture.</p>
          <h2>The boring wins first</h2>
          <p>Sleep 7-9 hours, drink half your body weight in pounds as ounces of water, walk 8,000+ steps. These three cost nothing and move more health metrics than any supplement.</p>
          <h2>Your daily numbers</h2>
        </div>

        {tool && <ToolClient tool={tool} />}

        <div className="seo">
          <h2>Related tools</h2>
          <ul>
            <li><Link href="/bmi-calculator">BMI Calculator</Link></li>
            <li><Link href="/body-fat-calculator">Body Fat Calculator</Link></li>
            <li><Link href="/water-intake-calculator">Water Intake Calculator</Link></li>
            <li><Link href="/sleep-calculator">Sleep Calculator</Link></li>
            <li><Link href="/calorie-deficit-calculator">Calorie Deficit Calculator</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
