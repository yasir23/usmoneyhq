// app/.well-known/agent-skills/index.json/route.ts — Agent Skills Discovery.
import { NextResponse } from "next/server";

export function GET() {
  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "usmoneyhq-calculators",
        type: "skill-md",
        description: "Use US Money HQ's free financial calculator API (105+ tools): mortgage, salary after tax, 401k, debt payoff, and more. POST https://usmoneyhq.com/api/calc/{tool} with JSON fields.",
        url: "https://usmoneyhq.com/.well-known/agent-skills/usmoneyhq-calculators/SKILL.md",
        digest: "sha256:76e5f3f52c2f9ca58c12eb209863d6d6ce8e5f0d0a42dba50e46493786c53707",
      },
    ],
  };
  return NextResponse.json(index, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
