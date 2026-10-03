#!/usr/bin/env python3
"""PROPERTYBridge public-data refresh.

Uses public government endpoints only. It does not bypass paywalls, CAPTCHAs,
login walls, robots controls, or listing-site access restrictions.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "propertybridge" / "data" / "auto-feed.json"
UA = "PROPERTYBridge-PublicData/1.0 (+https://lisapearsonskin.com/propertybridge/)"

HUD_URL = "https://egis.hud.gov/arcgis/rest/services/gotit/REOProperties/MapServer/0/query"
CHI_BASE = "https://data.cityofchicago.org/resource"

CHICAGO_TARGETS = [
    "5802 S May St Chicago IL",
    "7048 S Perry Ave Chicago IL",
    "912 W 87th St Chicago IL",
    "7357 S Green St Chicago IL",
    "6421 S Wolcott Ave Chicago IL",
    "7133 S Eggleston Ave Chicago IL",
    "9217 S Perry Ave Chicago IL",
    "1541 W Marquette Rd Chicago IL",
    "11931 S Wallace St Chicago IL",
    "12108 S Parnell Ave Chicago IL",
]

def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

def fetch_json(url: str, params: dict[str, str], timeout: int = 35):
    query = urllib.parse.urlencode(params)
    req = urllib.request.Request(url + "?" + query, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf-8"))

def clean_text(value) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()

def load_previous():
    try:
        return json.loads(OUT.read_text("utf-8"))
    except Exception:
        return {}

def hud_reo(previous_records):
    params = {
        "where": "1=1",
        "outFields": "OBJECTID,CASE_STEP_NUMBER,STREET_NUM,DIRECTION_PREFIX,STREET_NAME,CITY,STATE_CODE,DISPLAY_ZIP_CODE,REVITE_NAME",
        "returnGeometry": "false",
        "f": "json",
        "resultRecordCount": "1000",
        "orderByFields": "STATE_CODE,CITY,STREET_NAME",
    }
    try:
        payload = fetch_json(HUD_URL, params)
        if payload.get("error"):
            raise RuntimeError(payload["error"].get("message", "HUD ArcGIS error"))
        rows = []
        for feature in payload.get("features", []):
            a = feature.get("attributes") or {}
            street = " ".join(filter(None, [
                clean_text(a.get("STREET_NUM")),
                clean_text(a.get("DIRECTION_PREFIX")),
                clean_text(a.get("STREET_NAME")),
            ]))
            city = clean_text(a.get("CITY"))
            state = clean_text(a.get("STATE_CODE"))
            z = clean_text(a.get("DISPLAY_ZIP_CODE"))
            if z.isdigit():
                z = z.zfill(5)
            oid = clean_text(a.get("OBJECTID"))
            rows.append({
                "id": "HUD-" + oid,
                "source": "HUD FHA REO",
                "sourceType": "government",
                "verification": "VERIFIED_SOURCE",
                "address": street,
                "city": city,
                "state": state,
                "zip": z,
                "market": ", ".join(x for x in [city, state] if x),
                "caseStep": a.get("CASE_STEP_NUMBER"),
                "revitalizationArea": clean_text(a.get("REVITE_NAME")),
                "price": None,
                "loanRate": None,
                "financing": "UNKNOWN",
                "nextAction": "Open the official HUD source and verify sale status, price, condition, title and financing.",
                "sourceUrl": "https://egis.hud.gov/arcgis/rest/services/gotit/REOProperties/MapServer/0",
            })
        return rows, {"id": "hud-reo", "name": "HUD FHA REO", "status": "ok", "records": len(rows), "checkedAt": now_iso()}
    except Exception as exc:
        kept = [r for r in previous_records if r.get("source") == "HUD FHA REO"]
        return kept, {"id": "hud-reo", "name": "HUD FHA REO", "status": "error", "records": len(kept), "checkedAt": now_iso(), "error": clean_text(exc)[:240]}

def socrata_search(dataset: str, address: str):
    return fetch_json(
        f"{CHI_BASE}/{dataset}.json",
        {"$limit": "200", "$q": address},
        timeout=25,
    )

def record_matches_address(record: dict, address: str) -> bool:
    hay = " ".join(clean_text(v).upper() for v in record.values())
    tokens = [t for t in re.sub(r"[^A-Z0-9 ]", " ", address.upper()).split() if len(t) > 1]
    key = [t for t in tokens if t not in {"CHICAGO", "IL"}]
    return sum(t in hay for t in key[:4]) >= min(3, len(key[:4]))

def chicago_enrichment(previous):
    rows = []
    errors = []
    for address in CHICAGO_TARGETS:
        item = {
            "address": address,
            "checkedAt": now_iso(),
            "violationsHistoricalMatches": None,
            "permitsMatches": None,
            "note": "Counts are search matches in public historical datasets, not a title opinion or a count of currently outstanding violations.",
        }
        try:
            raw = socrata_search("22u3-xenr", address)
            item["violationsHistoricalMatches"] = sum(1 for r in raw if record_matches_address(r, address))
        except Exception as exc:
            errors.append(f"violations {address}: {clean_text(exc)[:120]}")
        try:
            raw = socrata_search("ydr8-5enu", address)
            item["permitsMatches"] = sum(1 for r in raw if record_matches_address(r, address))
        except Exception as exc:
            errors.append(f"permits {address}: {clean_text(exc)[:120]}")
        rows.append(item)

    if errors and all(r["violationsHistoricalMatches"] is None and r["permitsMatches"] is None for r in rows):
        rows = previous or rows

    status = "ok" if not errors else ("partial" if rows else "error")
    return rows, [
        {"id": "chicago-violations", "name": "Chicago Building Violations", "status": status, "records": len(rows), "checkedAt": now_iso()},
        {"id": "chicago-permits", "name": "Chicago Building Permits", "status": status, "records": len(rows), "checkedAt": now_iso()},
    ], errors[:10]

def main():
    previous = load_previous()
    records, hud_source = hud_reo(previous.get("records", []))
    chicago, chicago_sources, chicago_errors = chicago_enrichment(previous.get("chicago", []))

    feed = {
        "schemaVersion": 1,
        "generatedAt": now_iso(),
        "engine": "PROPERTYBridge Public Data Engine",
        "status": "ok" if hud_source.get("status") == "ok" else "partial",
        "sources": [hud_source, *chicago_sources],
        "records": records,
        "chicago": chicago,
        "errors": chicago_errors,
        "rules": [
            "Automated records are discovery and research signals, not completed due diligence.",
            "HUD REO records do not establish current asking price, assumability, APR, condition, title, taxes or profitability.",
            "Chicago violation data are historical/informational and should not be treated as a closing or title clearance.",
            "Listing portals that restrict automated access remain link/manual-review sources unless a licensed feed is connected.",
        ],
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUT.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(feed, indent=2, sort_keys=False) + "\n", "utf-8")
    os.replace(tmp, OUT)
    print(f"Wrote {OUT.relative_to(ROOT)} with {len(records)} HUD records and {len(chicago)} Chicago enrichments.")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"PROPERTYBridge refresh failed: {exc}", file=sys.stderr)
        raise
