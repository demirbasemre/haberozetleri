#!/usr/bin/env python3
"""
Duplicate article finder + applier.
- High confidence (seq >= 0.85): auto-marks as duplicate in data.json
- Medium + Low (seq >= 0.65): sends to Claude API for verification, then marks
Run with --dry-run to preview without modifying data.json
"""

import json
import re
import sys
import os
from datetime import datetime
from difflib import SequenceMatcher
from collections import defaultdict

DATA_FILE = "data.json"
WINDOW_DAYS = 7
HIGH_THRESHOLD = 0.92   # auto-mark (very safe)
LLM_THRESHOLD  = 0.65   # send to LLM
JACCARD_MIN    = 0.35   # pre-filter

DRY_RUN = "--dry-run" in sys.argv
USE_LLM = not ("--no-llm" in sys.argv)

STOP_WORDS = {
    "ve", "ile", "bir", "bu", "da", "de", "için", "olan", "yeni", "haber",
    "the", "a", "an", "and", "in", "of", "to", "for", "on", "at", "with",
    "is", "are", "by", "from", "its", "new",
}

def normalize(title):
    t = title.lower()
    t = re.sub(r"[^\w\s]", " ", t)
    return set(w for w in t.split() if w and w not in STOP_WORDS and len(w) > 2)

def jaccard(a, b):
    if not a or not b: return 0.0
    return len(a & b) / len(a | b)

def seq_ratio(a, b):
    return SequenceMatcher(None, a, b).ratio()

def parse_date(raw):
    if not raw: return None
    raw = raw.strip()
    for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(raw[:19], fmt)
        except Exception:
            pass
    m = re.search(r"(\w+ \d+,\s*\d{4})", raw)
    if m:
        try: return datetime.strptime(m.group(1), "%B %d, %Y")
        except Exception: pass
    return None

def ask_llm(pairs):
    """Send pairs to Claude API. Returns dict: (title_a, title_b) -> bool (is_duplicate)"""
    try:
        import anthropic
    except ImportError:
        print("  [!] anthropic paketi yok: pip install anthropic")
        return {}

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("  [!] ANTHROPIC_API_KEY env değişkeni bulunamadı")
        return {}

    client = anthropic.Anthropic(api_key=api_key)
    results = {}

    # Batch pairs into one prompt to save cost
    lines = []
    for i, (a, b) in enumerate(pairs):
        lines.append(f'{i+1}. A: "{a}"\n   B: "{b}"')

    prompt = (
        "Aşağıdaki haber başlığı çiftlerini incele. Her çift için bu iki haber aynı olayı/konuyu mu ele alıyor? "
        "Sadece rakam ve yes/no ile yanıt ver, her satırda bir çift. Örnek:\n1. yes\n2. no\n\n"
        + "\n".join(lines)
    )

    print(f"  LLM'e {len(pairs)} çift gönderiliyor...")
    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )
        text = msg.content[0].text.strip()
        print(f"  LLM yanıtı:\n{text}\n")
        for line in text.splitlines():
            m = re.match(r"(\d+)\.\s*(yes|no|evet|hayır)", line.strip(), re.IGNORECASE)
            if m:
                idx = int(m.group(1)) - 1
                if 0 <= idx < len(pairs):
                    results[pairs[idx]] = m.group(2).lower() in ("yes", "evet")
    except Exception as e:
        print(f"  [!] LLM hatası: {e}")

    return results

def main():
    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)

    title_to_idx = {a["title"]: i for i, a in enumerate(data) if a.get("title")}

    # Build candidate list (non-duplicate articles with dates)
    candidates = []
    for i, a in enumerate(data):
        if a.get("isDuplicate"):
            continue
        d = parse_date(a.get("date", ""))
        candidates.append({"idx": i, "art": a, "date": d, "words": normalize(a.get("title", ""))})

    dated = sorted([x for x in candidates if x["date"]], key=lambda x: x["date"])

    # Find pairs
    high_pairs = []   # auto-mark
    llm_pairs  = []   # send to LLM

    seen = set()
    for i, a in enumerate(dated):
        for j in range(i + 1, len(dated)):
            b = dated[j]
            if (b["date"] - a["date"]).days > WINDOW_DAYS:
                break
            key = (a["art"]["title"], b["art"]["title"])
            if key in seen:
                continue
            seen.add(key)
            if jaccard(a["words"], b["words"]) < JACCARD_MIN:
                continue
            score = seq_ratio(a["art"]["title"], b["art"]["title"])
            if score >= HIGH_THRESHOLD:
                high_pairs.append((a, b, score))
            elif score >= LLM_THRESHOLD:
                llm_pairs.append((a, b, score))

    print(f"Yüksek güven (otomatik): {len(high_pairs)}")
    print(f"LLM doğrulama: {len(llm_pairs)}")

    # Resolve LLM pairs
    confirmed_dupes = []  # list of (older_article, newer_article)

    # Auto-mark high confidence
    for a, b, score in high_pairs:
        # older = original, newer = duplicate
        orig, dupe = (a, b) if a["date"] <= b["date"] else (b, a)
        confirmed_dupes.append((orig, dupe, score, "auto"))
        print(f"  AUTO [{score:.2f}] {orig['art']['title'][:55]} ← {dupe['art']['title'][:55]}")

    # LLM pairs
    if USE_LLM and llm_pairs:
        pair_keys = [(a["art"]["title"], b["art"]["title"]) for a, b, _ in llm_pairs]
        llm_results = ask_llm(pair_keys)
        for (a, b, score), (ta, tb) in zip(llm_pairs, pair_keys):
            is_dup = llm_results.get((ta, tb))
            if is_dup is True:
                orig, dupe = (a, b) if a["date"] <= b["date"] else (b, a)
                confirmed_dupes.append((orig, dupe, score, "llm"))
                print(f"  LLM  [{score:.2f}] {orig['art']['title'][:55]} ← {dupe['art']['title'][:55]}")
            elif is_dup is False:
                print(f"  LLM HAYIR [{score:.2f}] {a['art']['title'][:45]} vs {b['art']['title'][:45]}")
            else:
                print(f"  LLM ?    [{score:.2f}] {a['art']['title'][:45]} vs {b['art']['title'][:45]}")
    elif not USE_LLM and llm_pairs:
        print("  (--no-llm: orta/düşük güven atlandı)")

    if not confirmed_dupes:
        print("\nHiç yeni duplicate bulunamadı.")
        return

    print(f"\nToplam {len(confirmed_dupes)} duplicate işlenecek.")

    if DRY_RUN:
        print("[DRY-RUN] data.json değiştirilmedi.")
        return

    # Apply changes
    changes = 0
    n8n_updates = []  # (orig_url, dupe_url, dupe_title) for Seen Articles table

    for orig, dupe, score, method in confirmed_dupes:
        orig_idx = title_to_idx.get(orig["art"]["title"])
        dupe_idx = title_to_idx.get(dupe["art"]["title"])
        if orig_idx is None or dupe_idx is None:
            continue

        # Mark dupe in data.json
        data[dupe_idx]["isDuplicate"] = True
        data[dupe_idx]["duplicateOf"] = orig["art"]["title"]

        # Add duplicateLinks to original in data.json
        if "duplicateLinks" not in data[orig_idx] or not isinstance(data[orig_idx]["duplicateLinks"], list):
            data[orig_idx]["duplicateLinks"] = []
        dupe_link = dupe["art"].get("link", "")
        if dupe_link and dupe_link not in data[orig_idx]["duplicateLinks"]:
            data[orig_idx]["duplicateLinks"].append(dupe_link)

        orig_url = orig["art"].get("link", "")
        n8n_updates.append((orig_url, dupe_link, dupe["art"]["title"]))
        changes += 1

    # Backup + write data.json
    import shutil
    shutil.copy(DATA_FILE, DATA_FILE + ".bak")
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n{changes} kayıt güncellendi. Yedek: {DATA_FILE}.bak")

    # Update n8n Seen Articles table
    update_seen_articles(n8n_updates, data, title_to_idx)


def update_seen_articles(n8n_updates, data, title_to_idx):
    """Update n8n Seen Articles table with duplicate info."""
    n8n_url = os.environ.get("N8N_BASE_URL", "https://n8n.emredemirbas.com")
    n8n_key  = os.environ.get("N8N_API_KEY", "")
    if not n8n_key:
        print("\n[!] N8N_API_KEY bulunamadı, Seen Articles tablosu atlandı.")
        return

    TABLE_ID = "R5qe5TCbV8X1UPFf"
    headers = {"X-N8N-API-KEY": n8n_key, "Content-Type": "application/json"}
    base = f"{n8n_url}/api/v1/tables/{TABLE_ID}"

    import urllib.request
    import urllib.parse

    def n8n_request(method, url, body=None):
        req = urllib.request.Request(url, headers=headers, method=method)
        if body:
            req.data = json.dumps(body).encode()
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return json.loads(r.read())
        except Exception as e:
            print(f"  [!] n8n isteği başarısız: {e}")
            return None

    print("\nn8n Seen Articles tablosu güncelleniyor...")
    n8n_changes = 0

    for orig_url, dupe_url, dupe_title in n8n_updates:
        if not orig_url and not dupe_url:
            continue

        # Update duplicate row: isDuplicate=true, duplicateOf=orig_url
        if dupe_url:
            search_url = f"{base}/rows?filter[0][columnName]=articleUrl&filter[0][condition]=eq&filter[0][value]={urllib.parse.quote(dupe_url, safe='')}&limit=1"
            resp = n8n_request("GET", search_url)
            if resp and resp.get("rows"):
                row_id = resp["rows"][0]["id"]
                n8n_request("PATCH", f"{base}/rows/{row_id}", {
                    "isDuplicate": "true",
                    "duplicateOf": orig_url
                })
                print(f"  DUPE güncellendi: {dupe_title[:50]}")
                n8n_changes += 1

        # Update original row: add dupe_url to duplicateLinks
        if orig_url and dupe_url:
            search_url = f"{base}/rows?filter[0][columnName]=articleUrl&filter[0][condition]=eq&filter[0][value]={urllib.parse.quote(orig_url, safe='')}&limit=1"
            resp = n8n_request("GET", search_url)
            if resp and resp.get("rows"):
                row_id = resp["rows"][0]["id"]
                existing = resp["rows"][0].get("duplicateLinks") or ""
                links = [l.strip() for l in existing.split(",") if l.strip()] if existing else []
                if dupe_url not in links:
                    links.append(dupe_url)
                n8n_request("PATCH", f"{base}/rows/{row_id}", {
                    "duplicateLinks": ", ".join(links)
                })
                print(f"  ORİJ güncellendi: duplicateLinks → {len(links)} link")
                n8n_changes += 1

    print(f"n8n: {n8n_changes} satır güncellendi.")

if __name__ == "__main__":
    main()
