#!/usr/bin/env python3
"""Refresh assets/data/news.json from public Google News RSS searches.

Runs daily in GitHub Actions. If every feed fails, the existing file is left untouched,
so the site never shows an empty news section because of a temporary network error.
"""
import datetime as dt
import email.utils
import json
import os
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "data", "news.json")
QUERIES = [
    ("GST", "GST India small business when:7d"),
    ("GST", "GST council OR GSTN when:7d"),
    ("MSME", "MSME India when:7d"),
    ("Tax", "income tax India deadline when:7d"),
    ("Credit", "Mudra loan OR MSME credit India when:7d"),
    ("Payments", "UPI merchants India when:7d"),
]
UA = "Mozilla/5.0 (compatible; BahiKhataNewsBot/1.0; +https://bahikhata.com/news/)"


def fetch(q):
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q, "hl": "en-IN", "gl": "IN", "ceid": "IN:en"})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read()


def parse(xml_bytes, topic):
    items = []
    root = ET.fromstring(xml_bytes)
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        src_el = it.find("source")
        source = (src_el.text or "").strip() if src_el is not None else ""
        if source and title.endswith(" - " + source):
            title = title[: -len(" - " + source)]
        pub = it.findtext("pubDate")
        try:
            published = email.utils.parsedate_to_datetime(pub).astimezone(dt.timezone.utc).isoformat() if pub else ""
        except (TypeError, ValueError):
            published = ""
        if title and link.startswith("http"):
            items.append({"title": title, "link": link, "source": source, "published": published, "topic": topic})
    return items


def main():
    seen, items, ok = set(), [], 0
    for topic, q in QUERIES:
        try:
            got = parse(fetch(q), topic)
            ok += 1
        except Exception as e:  # network or parse error: skip this feed
            print("feed failed:", q, e)
            continue
        for x in got:
            key = re.sub(r"[^a-z0-9]", "", x["title"].lower())[:80]
            if key in seen:
                continue
            seen.add(key)
            items.append(x)
    if not ok or not items:
        print("No feeds available; keeping existing news.json")
        return
    items.sort(key=lambda x: x["published"], reverse=True)
    data = {"updated": dt.datetime.now(dt.timezone.utc).isoformat(), "items": items[:60]}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=0)
    print("Wrote %d headlines from %d feeds" % (len(data["items"]), ok))


if __name__ == "__main__":
    main()
