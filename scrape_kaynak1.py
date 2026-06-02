"""
Kaynak 2 fleet scraper — tüm 21 havayolu
Kaynak: https://www.kaynak2.com/airlines/{IATA}#fleetsBases
"""
import urllib.request, json, urllib.parse, time

TOKEN   = "2BR6DgQzZL8md4Bk5rewy3K9k"
LAUNCH  = urllib.parse.quote('{"stealth":true}')
BL_URL  = f"http://localhost:19222/chromium/function?token={TOKEN}&launch={LAUNCH}"

CHASESSID = "bde2561c54fa4a815236a043583e9ba7"
CHARC     = "vfIQ1z1cspUia22o9XF0uDzBqjwRxRTB"
CF_BM     = "lsDFKvwm5tw1F__ngYVGhTDaLSf2EJu1_S2Dm2w4NF0-1780395565.2609146-1.0.1.1-1tsJcMeiC79J24lHzq4yGEj87OSmmicuOn_aLtmGz_ULvjztSc.aRBz0vGbufzBYKcVuHofBUTC_KN7IJCz3AmcKaJnU62IKvmUgglCyqABu7OexQ34VyKWKcpCg7Fz8"

AIRLINES = [
    ("QR","Qatar Airways"),("EK","Emirates"),("TK","Turkish Airlines"),
    ("AF","Air France"),("CI","China Airlines"),("CX","Cathay Pacific"),
    ("ET","Ethiopian"),("LH","Lufthansa"),("LA","LATAM"),("KE","Korean Air"),
    ("7L","Silkway West"),("CA","Air China"),("SQ","Singapore Airlines"),
    ("OZ","Asiana Airlines"),("CK","China Cargo Airlines"),("SV","Saudia"),
    ("NH","ANA"),("EY","Etihad Airways"),("CZ","China Southern"),
    ("AV","Avianca"),("CV","Cargolux"),
]

def build_js(iata):
    return (
        'export default async ({ page }) => {\n'
        '  await page.setCookie(\n'
        '    { name: "CHASESSID", value: "' + CHASESSID + '", domain: ".kaynak2.com", path: "/" },\n'
        '    { name: "CHARC",     value: "' + CHARC     + '", domain: ".kaynak2.com", path: "/" },\n'
        '    { name: "__cf_bm",   value: "' + CF_BM     + '", domain: ".kaynak2.com", path: "/" }\n'
        '  );\n'
        '  await page.goto("https://www.kaynak2.com/airlines/' + iata + '#fleetsBases", {\n'
        '    waitUntil: "networkidle2", timeout: 35000\n'
        '  });\n'
        '  await new Promise(r => setTimeout(r, 5000));\n'
        '  const data = await page.evaluate(() => {\n'
        '    const tables = document.querySelectorAll("table");\n'
        '    const result = [];\n'
        '    tables.forEach(tbl => {\n'
        '      const rows = Array.from(tbl.querySelectorAll("tr"));\n'
        '      if (rows.length < 2) return;\n'
        '      const headers = Array.from(rows[0].querySelectorAll("th,td")).map(c => c.innerText.trim());\n'
        '      const tableRows = rows.slice(1).map(row =>\n'
        '        Array.from(row.querySelectorAll("th,td")).map(c => c.innerText.trim())\n'
        '      ).filter(r => r.some(c => c));\n'
        '      if (tableRows.length > 0) result.push({ headers, rows: tableRows });\n'
        '    });\n'
        '    return result;\n'
        '  });\n'
        '  return { title: document.title, tables: data };\n'
        '};\n'
    )


def parse_fleet_tables(tables):
    """Tablolardan anlamlı filo verisini çıkar."""
    fleet = []   # aktif uçaklar
    orders = []  # siparişler

    for tbl in tables:
        headers = tbl["headers"]
        rows    = tbl["rows"]

        # Ana filo tablosu: "Aircraft Variant", "Active" sütunları var
        if "Aircraft Variant" in headers and "Active" in headers:
            ai = headers.index("Aircraft Variant")
            act_i  = headers.index("Active") if "Active" in headers else -1
            inact_i= headers.index("Inactive") if "Inactive" in headers else -1
            tot_i  = headers.index("Total") if "Total" in headers else -1
            age_i  = headers.index("Ø Age") if "Ø Age" in headers else -1
            del_i  = headers.index("To be delivered") if "To be delivered" in headers else -1
            cap_i  = headers.index("Capacity") if "Capacity" in headers else -1

            for row in rows:
                if len(row) <= ai: continue
                variant = row[ai].replace("\n"," ").strip()
                if not variant or variant in ("Total",): continue

                def get(i): return row[i].strip() if i >= 0 and i < len(row) else ""
                active   = get(act_i)
                inactive = get(inact_i)
                total    = get(tot_i)
                age      = get(age_i)
                tbd      = get(del_i)
                capacity = get(cap_i)

                # Sadece aktif veya bekleyen varsa ekle
                if active or total or tbd:
                    fleet.append({
                        "variant":  variant,
                        "active":   active,
                        "inactive": inactive,
                        "total":    total,
                        "on_order": tbd,
                        "avg_age":  age,
                        "capacity": capacity,
                    })

        # Sipariş tablosu: "Aircraft On Order" sütunu var
        elif "Aircraft On Order" in headers and "Aircraft Variant" in headers:
            ai    = headers.index("Aircraft Variant")
            ord_i = headers.index("Aircraft On Order")
            opt_i = headers.index("Order Option") if "Order Option" in headers else -1
            for row in rows:
                if len(row) <= ai: continue
                variant = row[ai].strip()
                if not variant: continue
                def get(i): return row[i].strip() if i >= 0 and i < len(row) else ""
                orders.append({
                    "variant":  variant,
                    "quantity": get(ord_i),
                    "option":   get(opt_i),
                })

    return fleet, orders


def scrape_airline(iata, name):
    code = build_js(iata)
    req = urllib.request.Request(
        BL_URL,
        data=code.encode(),
        headers={"Content-Type": "application/javascript"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=75) as r:
            resp = json.loads(r.read())
        fleet, orders = parse_fleet_tables(resp.get("tables", []))
        active_count = sum(int(f["active"]) for f in fleet
                          if f["active"] and f["active"].isdigit())
        return {
            "iata":   iata,
            "name":   name,
            "source": "kaynak2",
            "date":   "2026-06-02",
            "fleet":  fleet,
            "orders": orders,
            "active_total": active_count,
        }
    except Exception as e:
        return {"iata": iata, "name": name, "error": str(e)}


if __name__ == "__main__":
    results = {}
    for iata, name in AIRLINES:
        print(f"  → {iata} {name} ...", end="", flush=True)
        r = scrape_airline(iata, name)
        results[iata] = r
        active = r.get("active_total", "?")
        err    = r.get("error", "")
        print(f" aktif={active}" + (f" ⚠ {err}" if err else ""))
        time.sleep(3)   # rate-limit

    out = "/Users/emre/Desktop/haberozetleri/kaynak2_data.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Kaydedildi → {out}")
