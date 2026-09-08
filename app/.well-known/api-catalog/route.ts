// app/.well-known/api-catalog/route.ts — RFC 9727 API catalog (linkset+json).
import { NextResponse } from "next/server";

export function GET() {
  const linkset = [
    // Calculators REST API — schema endpoint (service-desc -> /openapi.json)
    {
      anchor: "https://usmoneyhq.com",
      "service-desc": [
        { href: "https://usmoneyhq.com/openapi.json", type: "application/openapi+json" },
      ],
      "service-doc": [
        { href: "https://usmoneyhq.com/developers", type: "text/html" },
      ],
      "api-catalog": [{ href: "https://usmoneyhq.com/.well-known/api-catalog" }],
    },
  ];
  return NextResponse.json({ linkset }, {
    headers: { "Content-Type": "application/linkset+json; charset=utf-8" },
  });
}
