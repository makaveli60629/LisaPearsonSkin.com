#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

PUBLIC_PAGES = [
    "index.html",
    "projects/custom/index.html",
    "templates/index.html",
    "marketplace/index.html",
    "brand-studio/index.html",
    "projects/propertybridge/index.html",
    "kingdom/index.html",
    "projects/kingdom/index.html",
    "studio/index.html",
]

REQUIRED_FILES = [
    "CNAME",
    "robots.txt",
    "sitemap.xml",
    *PUBLIC_PAGES,
]

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.meta = {}
        self.canonical = None
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in {"a", "link"} and a.get("href"):
            self.links.append(a["href"])
        if tag in {"img", "script", "source"} and a.get("src"):
            self.links.append(a["src"])
        if tag == "meta":
            key = a.get("name") or a.get("property")
            if key and a.get("content"):
                self.meta[key.lower()] = a["content"].strip()
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data

def local_target(page_path: Path, href: str):
    href = href.strip()
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    parsed = urlparse(href)
    if parsed.scheme or parsed.netloc:
        return None
    path = unquote(parsed.path)
    if not path:
        return None
    if path.startswith("/"):
        target = ROOT / path.lstrip("/")
    else:
        target = page_path.parent / path
    if path.endswith("/"):
        target = target / "index.html"
    return target.resolve()

errors = []
warnings = []

for rel in REQUIRED_FILES:
    if not (ROOT / rel).exists():
        errors.append(f"Missing required file: {rel}")

try:
    ET.parse(ROOT / "sitemap.xml")
except Exception as exc:
    errors.append(f"sitemap.xml is not valid XML: {exc}")

robots = (ROOT / "robots.txt").read_text(encoding="utf-8", errors="ignore") if (ROOT / "robots.txt").exists() else ""
if "Sitemap:" not in robots:
    errors.append("robots.txt does not declare the sitemap.")

for rel in PUBLIC_PAGES:
    path = ROOT / rel
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    parser = Parser()
    parser.feed(text)

    if not parser.title.strip():
        errors.append(f"{rel}: missing <title>.")
    desc = parser.meta.get("description", "")
    if not desc:
        errors.append(f"{rel}: missing meta description.")
    if not parser.canonical:
        errors.append(f"{rel}: missing canonical URL.")
    robots_meta = parser.meta.get("robots", "").lower()
    if "noindex" in robots_meta:
        errors.append(f"{rel}: public page is marked noindex.")
    if not parser.meta.get("og:title"):
        warnings.append(f"{rel}: missing og:title.")
    if not parser.meta.get("og:description"):
        warnings.append(f"{rel}: missing og:description.")

    for href in parser.links:
        target = local_target(path, href)
        if target is None:
            continue
        try:
            target.relative_to(ROOT.resolve())
        except ValueError:
            continue
        if target.exists():
            continue
        if target.suffix == "" and (target / "index.html").exists():
            continue
        errors.append(f"{rel}: broken local reference -> {href}")

print("LPS Project Studio pre-deploy validation")
print(f"Checked {len(PUBLIC_PAGES)} public pages.")
for w in warnings:
    print(f"WARNING: {w}")
if errors:
    print("\nValidation failed:")
    for e in errors:
        print(f"- {e}")
    sys.exit(1)

print("Validation passed. Site is ready for GitHub Pages deployment.")
