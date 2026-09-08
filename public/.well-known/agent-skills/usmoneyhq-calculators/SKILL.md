---
name: usmoneyhq-calculators
description: Use US Money HQ's free US financial calculator API. POST JSON fields to https://usmoneyhq.com/api/calc/{tool} — no key, CORS-open. 105+ tools including mortgage, salary-after-tax, paycheck, tax, 401k, debt-payoff, home-affordability, HELOC, PMI, DTI.
---

# US Money HQ Calculators

Free US financial calculators as a machine API. No API key. CORS-open.

## Compute a value

```
POST https://usmoneyhq.com/api/calc/mortgage-calculator
Content-Type: application/json

{"price": 400000, "downPct": 20, "rate": 6.5, "years": 30}
```

Response: `{"tool": "...", "results": [{"label": "...", "value": "...", "highlight": bool}]}`

## Discover a tool's input schema

```
GET https://usmoneyhq.com/api/calc/{tool-slug}
```

Returns `fields` (key, label, type, defaults, options).

## Common tool slugs

- mortgage-calculator, home-affordability-calculator, salary-after-tax-calculator,
  paycheck-calculator, tax-calculator, 401k-calculator, 401k-contribution-calculator,
  debt-payoff-calculator, credit-card-payoff-calculator, dti-calculator,
  compound-interest-calculator, retirement-calculator, heloc-calculator,
  pmi-calculator, property-tax-calculator, take-home-pay-calculator,
  fha-mortgage-calculator, va-mortgage-calculator, savings-goal-calculator

## MCP

Same tools available over MCP: `https://usmoneyhq.com/api/mcp` (streamable HTTP).
