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
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "propertybridge" / "data" / "auto-feed.json"
UA = "PROPERTYBridge-PublicData/1.0 (+https://lisapearsonskin.com/propertybridge/)"

HUD_URL = "https://egis.hud.gov/arcgis/rest/services/gotit/REOProperties/MapServer/0/query"
CHI_BASE = "https://data.cityofchicago.org/resource"

HUD_STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","PR"
]

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
    fields = "OBJECTID,CASE_STEP_NUMBER,STREET_NUM,DIRECTION_PREFIX,STREET_NAME,CITY,STATE_CODE,DISPLAY_ZIP_CODE,REVITE_NAME"

    def fetch_state(state):
        params = {
            "where": f"STATE_CODE='{state}'",
            "outFields": fields,
            "returnGeometry": "false",
            "f": "json",
            "resultRecordCount": "80",
            "orderByFields": "OBJECTID",
        }
        payload = fetch_json(HUD_URL, params, timeout=20)
        if payload.get("error"):
            raise RuntimeError(payload["error"].get("message", f"HUD ArcGIS error for {state}"))
        state_rows = []
        for feature in payload.get("features", []):
            a = feature.get("attributes") or {}
            street = " ".join(filter(None, [
                clean_text(a.get("STREET_NUM")),
                clean_text(a.get("DIRECTION_PREFIX")),
                clean_text(a.get("STREET_NAME")),
            ]))
            city = clean_text(a.get("CITY"))
            st = clean_text(a.get("STATE_CODE"))
            z = clean_text(a.get("DISPLAY_ZIP_CODE"))
            if z.isdigit():
                z = z.zfill(5)
            oid = clean_text(a.get("OBJECTID"))
            state_rows.append({
                "id": "HUD-" + oid,
                "source": "HUD FHA REO",
                "sourceType": "government",
                "verification": "VERIFIED_SOURCE",
                "address": street,
                "city": city,
                "state": st,
                "zip": z,
                "market": ", ".join(x for x in [city, st] if x),
                "caseStep": a.get("CASE_STEP_NUMBER"),
                "revitalizationArea": clean_text(a.get("REVITE_NAME")),
                "price": None,
                "loanRate": None,
                "financing": "UNKNOWN",
                "nextAction": "Open the official HUD source and verify sale status, price, condition, title and financing.",
                "sourceUrl": "https://egis.hud.gov/arcgis/rest/services/gotit/REOProperties/MapServer/0",
            })
        return state, state_rows

    rows = []
    errors = []
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = [pool.submit(fetch_state, state) for state in HUD_STATES]
        for future in as_completed(futures):
            try:
                _, state_rows = future.result()
                rows.extend(state_rows)
            except Exception as exc:
                errors.append(clean_text(exc)[:180])

    rows.sort(key=lambda r: (r.get("state") or "", r.get("city") or "", r.get("address") or ""))
    if not rows:
        kept = [r for r in previous_records if r.get("source") == "HUD FHA REO"]
        return kept, {
            "id": "hud-reo",
            "name": "HUD FHA REO",
            "status": "error",
            "records": len(kept),
            "statesCovered": len({r.get("state") for r in kept if r.get("state")}),
            "checkedAt": now_iso(),
            "error": "; ".join(errors[:5]) or "HUD feed returned no records",
        }

    states_covered = len({r.get("state") for r in rows if r.get("state")})
    return rows, {
        "id": "hud-reo",
        "name": "HUD FHA REO",
        "status": "ok" if not errors else "partial",
        "records": len(rows),
        "statesCovered": states_covered,
        "sampleLimitPerState": 80,
        "checkedAt": now_iso(),
        "note": "Nationwide discovery sample; up to 80 current records per state/territory returned by the HUD layer.",
    }

def sql_quote(value: str) -> str:
    return value.replace("'", "''")

def chicago_street(address: str):
    normalized = re.sub(r"\s+CHICAGO\s+IL$", "", address, flags=re.I).strip().upper()
    m = re.match(r"^(\d+)\s+([NSEW])\s+(.+)$", normalized)
    if not m:
        raise ValueError(f"Could not parse Chicago address: {address}")
    return int(m.group(1)), m.group(2), m.group(3)

def socrata_count(dataset: str, address: str) -> int:
    number, direction, street_name = chicago_street(address)
    plain = f"{number} {direction} {street_name}"
    if dataset == "22u3-xenr":
        where = f"upper(address)='{sql_quote(plain)}'"
    elif dataset == "ydr8-5enu":
        where = (
            f"street_number={number} AND street_direction='{direction}' "
            f"AND upper(street_name)='{sql_quote(street_name)}'"
        )
    else:
        raise ValueError("Unsupported Chicago dataset")
    payload = fetch_json(
        f"{CHI_BASE}/{dataset}.json",
        {"$select": "count(*) as count", "$where": where},
        timeout=12,
    )
    if not payload:
        return 0
    return int(payload[0].get("count", 0))

def chicago_enrichment(previous):
    datasets = {
        "violationsHistoricalMatches": "22u3-xenr",
        "permitsMatches": "ydr8-5enu",
    }
    result_map = {
        address: {
            "address": address,
            "checkedAt": now_iso(),
            "violationsHistoricalMatches": None,
            "permitsMatches": None,
            "note": "Counts are exact-address matches in public historical datasets, not a title opinion or a count of currently outstanding violations.",
        }
        for address in CHICAGO_TARGETS
    }
    errors = []

    def run_one(address, field, dataset):
        return address, field, socrata_count(dataset, address)

    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = [
            pool.submit(run_one, address, field, dataset)
            for address in CHICAGO_TARGETS
            for field, dataset in datasets.items()
        ]
        for future in as_completed(futures):
            try:
                address, field, count = future.result()
                result_map[address][field] = count
            except Exception as exc:
                errors.append(clean_text(exc)[:180])

    rows = [result_map[a] for a in CHICAGO_TARGETS]
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
