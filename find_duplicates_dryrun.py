#!/usr/bin/env python3
"""
Dry-run duplicate finder. Reads data.json, detects potential duplicates
using title similarity within 7-day windows. Prints matches; does NOT modify data.
"""

import json
import re
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from collections import defaultdict

DATA_FILE = "data.json"
WINDOW_DAYS = 7
JACCARD_THRESHOLD = 0.35   # word-overlap (lower = more matches)
SEQUENCE_THRESHOLD = 0.65  # SequenceMatcher ratio (higher = stricter)

STOP_WORDS = {
    "ve", "ile", "bir", "bu", "da", "de", "için", "olan", "olan", "olan",
    "the", "a", "an", "and", "in", "of", "to", "for", "on", "at", "with",
    "is", "are", "by", "from", "its", "new", "yeni", "haber",
}

def normalize(title):
    t = title.lower()
    t = re.sub(r"[^\w\s]", " ", t)
    words = [w for w in t.split() if w and w not in STOP_WORDS and len(w) > 2]
    return set(words)

def jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)

def seq_ratio(a, b):
    return SequenceMatcher(None, a, b).ratio()

def parse_date(raw):
    if not raw:
        return None
    raw = raw.strip()
    # Try ISO
    for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(raw[:len(fmt.replace("%Y","0000").replace("%m","00").replace("%d","00").replace("%H","00").replace("%M","00").replace("%S","00"))], fmt)
        except Exception:
            pass
    # Try "Published: Weekday, Month D, YYYY"
    m = re.search(r"(\w+ \d+,\s*\d{4})", raw)
    if m:
        try:
            return datetime.strptime(m.group(1), "%B %d, %Y")
        except Exception:
            pass
    return None

def main():
    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)

    # Already-marked duplicates
    already_marked = {a["title"] for a in data if a.get("isDuplicate")}
    print(f"Toplam haber: {len(data)}")
    print(f"Zaten işaretlenmiş duplicate: {len(already_marked)}")

    # Parse dates
    articles = []
    no_date = 0
    for a in data:
        if a.get("isDuplicate"):
            continue
        d = parse_date(a.get("date", ""))
        if d is None:
            no_date += 1
        articles.append({"art": a, "date": d, "words": normalize(a.get("title", ""))})

    print(f"Tarihsiz (atlanacak): {no_date}")
    print(f"Taranacak haber: {len(articles)}\n")

    # Group by date bucket for window comparison
    dated = [x for x in articles if x["date"] is not None]
    dated.sort(key=lambda x: x["date"])

    matches = []
    seen_pairs = set()

    for i, a in enumerate(dated):
        for j in range(i + 1, len(dated)):
            b = dated[j]
            if (b["date"] - a["date"]).days > WINDOW_DAYS:
                break
            pair = (a["art"]["title"], b["art"]["title"])
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)

            jac = jaccard(a["words"], b["words"])
            if jac < JACCARD_THRESHOLD:
                continue
            seq = seq_ratio(a["art"].get("title", ""), b["art"].get("title", ""))
            if seq < SEQUENCE_THRESHOLD:
                continue

            matches.append({
                "score_jaccard": round(jac, 2),
                "score_seq": round(seq, 2),
                "date_a": a["date"].strftime("%Y-%m-%d"),
                "date_b": b["date"].strftime("%Y-%m-%d"),
                "source_a": a["art"].get("source", ""),
                "source_b": b["art"].get("source", ""),
                "title_a": a["art"]["title"],
                "title_b": b["art"]["title"],
            })

    matches.sort(key=lambda x: x["score_seq"], reverse=True)

    print(f"{'='*80}")
    print(f"BULUNAN POTANSİYEL DUPLICATE: {len(matches)}")
    print(f"{'='*80}\n")

    by_score = defaultdict(list)
    for m in matches:
        if m["score_seq"] >= 0.85:
            by_score["yüksek (≥0.85)"].append(m)
        elif m["score_seq"] >= 0.75:
            by_score["orta (0.75–0.85)"].append(m)
        else:
            by_score["düşük (0.65–0.75)"].append(m)

    for label, group in by_score.items():
        print(f"── {label.upper()}: {len(group)} eşleşme ──")
        for m in group[:20]:  # max 20 per group
            print(f"  [{m['date_a']}] {m['source_a']}: {m['title_a'][:60]}")
            print(f"  [{m['date_b']}] {m['source_b']}: {m['title_b'][:60]}")
            print(f"  → Jaccard: {m['score_jaccard']}  Seq: {m['score_seq']}")
            print()
        if len(group) > 20:
            print(f"  ... ve {len(group)-20} tane daha\n")

    print(f"\nÖzet: {len(by_score.get('yüksek (≥0.85)',[]))} yüksek, "
          f"{len(by_score.get('orta (0.75–0.85)',[]))} orta, "
          f"{len(by_score.get('düşük (0.65–0.75)',[]))} düşük güven eşleşme")

if __name__ == "__main__":
    main()
