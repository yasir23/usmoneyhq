#!/usr/bin/env python3
"""
usmoneyhq_graph.py — the heartbeat as a LangGraph state machine.

Why a graph instead of the linear script: the loop has a genuine branch. If telemetry shows a
blocker only a human can clear (no ad units, no live offers, key not served), the run must stop
and escalate rather than push another content commit. If it shows work it can do itself, it
should proceed. That conditional edge is what a graph expresses and what an if-statement buried
in a cron script hides.

Run:  ~/.venvs/agents/bin/python ~/us-calc-tools/scripts/usmoneyhq_graph.py
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from typing import TypedDict

from langgraph.graph import END, StateGraph

REPO = os.path.expanduser("~/us-calc-tools")
SITE = "https://usmoneyhq.com"
KEYFILE = "a7f3c9d21b8e4f6a9c0d5e2b7f4318ad.txt"


class State(TypedDict, total=False):
    telemetry: dict
    blockers: list
    tasks: list
    action: str
    result: str


def sh(cmd, cwd=REPO, timeout=120):
    r = subprocess.run(cmd, shell=isinstance(cmd, str), cwd=cwd,
                       capture_output=True, text=True, timeout=timeout)
    return r.returncode, (r.stdout or "") + (r.stderr or "")


def collect(state: State) -> State:
    t = {}
    for name, url in (("site", SITE), ("llms", SITE + "/llms.txt"),
                      ("key", SITE + "/" + KEYFILE)):
        _, out = sh(["curl", "-s", "-o", "/dev/null", "-m", "20", "-w", "%{http_code}", url])
        t[name + "_http"] = out.strip()
    _, out = sh(["curl", "-s", "-m", "30", SITE + "/sitemap.xml"])
    t["sitemap_urls"] = out.count("<loc>")
    src = open(os.path.join(REPO, "lib/affiliates.ts"), encoding="utf-8").read()
    t["offers_live"] = len(re.findall(r"live:\s*true", src))
    t["offers_total"] = len(re.findall(r"live:\s*(?:true|false)", src))
    _, out = sh(["git", "status", "--porcelain"])
    t["dirty"] = len([l for l in out.splitlines() if l.strip()])
    return {"telemetry": t}


def diagnose(state: State) -> State:
    """Blocker detection is deterministic, not a model's opinion. Models embellish here."""
    t = state["telemetry"]
    blockers = []
    if t.get("site_http") != "200":
        blockers.append({"id": "site_down", "ask": "site is not serving 200"})
    if t.get("key_http") != "200":
        blockers.append({"id": "indexnow_key", "ask": "IndexNow key file not served"})
    if t.get("offers_live", 0) < 3:
        blockers.append({"id": "no_offers",
                         "ask": "affiliate tracking URLs (only %d of %d offers live)"
                                % (t.get("offers_live", 0), t.get("offers_total", 0))})
    if os.path.exists(os.path.join(REPO, "HUMAN_INPUTS.env")):
        vals = [l for l in open(os.path.join(REPO, "HUMAN_INPUTS.env"))
                if "=" in l and not l.startswith("#") and l.split("=", 1)[1].strip()]
        if vals:
            blockers.append({"id": "inputs_pending", "ask": "HUMAN_INPUTS has %d unconsumed value(s)"
                                                        % len(vals)})
    else:
        blockers.append({"id": "no_inputs_file", "ask": "GSC token, Bing token, 3 ad slot ids"})
    return {"blockers": blockers}


def route(state: State) -> str:
    """The conditional edge: escalate, or do work."""
    if any(b["id"] in ("site_down", "indexnow_key") for b in state["blockers"]):
        return "escalate"          # broken fundamentals: do not commit content on top
    if state["telemetry"].get("dirty", 0) > 3:
        return "escalate"
    return "plan"


def plan(state: State) -> State:
    """Rank mechanical work from telemetry alone — no model, so it cannot invent a task."""
    tasks = []
    if state["telemetry"].get("sitemap_urls", 0) < 200:
        tasks.append("expand long-tail coverage from ACS/BLS datasets (116 -> 200 pages)")
    if state["telemetry"].get("offers_live", 0) < 3:
        tasks.append("blocked: offers need tracking URLs")
    if not tasks:
        tasks.append("review NEXT_TASKS.json and pick the top medium-risk item")
    return {"tasks": tasks}


def escalate(state: State) -> State:
    msg = "; ".join(b["ask"] for b in state["blockers"])
    return {"action": "escalate", "result": msg}


def execute(state: State) -> State:
    # Deliberately no push here: the cron heartbeat owns deployment. This graph decides
    # WHETHER work should happen; it does not become a second writer to the same repo.
    return {"action": "would_push", "result": " | ".join(state["tasks"])}


g = StateGraph(State)
g.add_node("collect", collect)
g.add_node("diagnose", diagnose)
g.add_node("plan", plan)
g.add_node("escalate", escalate)
g.add_node("execute", execute)
g.set_entry_point("collect")
g.add_edge("collect", "diagnose")
g.add_conditional_edges("diagnose", route, {"escalate": "escalate", "plan": "plan"})
g.add_edge("plan", "execute")
g.add_edge("execute", END)
g.add_edge("escalate", END)
app = g.compile()

if __name__ == "__main__":
    out = app.invoke({})
    print(json.dumps(out, indent=1))
    print("\nROUTE:", out.get("action"), "|", out.get("result", "")[:160])
