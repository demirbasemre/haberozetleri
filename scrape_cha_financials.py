"""
CH Aviation Finansal Veri Scraper
#financials + #pax bölümlerini çeker, USD para biriminde
"""
import urllib.request, json, urllib.parse, time, re

CHASESSID = "bde2561c54fa4a815236a043583e9ba7"
CHARC     = "vfIQ1z1cspUia22o9XF0uDzBqjwRxRTB"
TOKEN     = "2BR6DgQzZL8md4Bk5rewy3K9k"
LAUNCH    = urllib.parse.quote('{"stealth":true}')
BL_URL    = f"http://localhost:19222/chromium/function?token={TOKEN}&launch={LAUNCH}"

# CHA slug → IATA key
AIRLINES = [
    ("QR","Qatar Airways"),("EK","Emirates"),("TK","Turkish Airlines"),
    ("AF","Air France"),("CI","China Airlines"),("CX","Cathay Pacific"),
    ("ET","Ethiopian Airlines"),("LH","Lufthansa"),("LA","LATAM"),
    ("KE","Korean Air"),("CA","Air China"),("SQ","Singapore Airlines"),
    ("OZ","Asiana Airlines"),("SV","Saudia"),("NH","ANA"),
    ("ETI","Etihad Airways"),("CZ","China Southern"),("AV","Avianca"),
    ("CV","Cargolux"),("A4B","AJet"),
]

JS_CODE = r"""export default async ({ page }) => {
  await page.setCookie(
    { name: "CHASESSID", value: "SESS", domain: ".ch-aviation.com", path: "/" },
    { name: "CHARC",     value: "CHARC_V", domain: ".ch-aviation.com", path: "/" }
  );
  
  await page.goto("https://www.ch-aviation.com/airlines/SLUG#financials", 
    { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));
  
  // USD seçili değilse seç
  const currencyUSD = await page.evaluate(() => {
    // Para birimi dropdown'u bul
    const sel = document.querySelector('select[name*="currency"], [data-currency-select]');
    if (sel) {
      const opt = Array.from(sel.options||[]).find(o=>o.value==='USD'||o.text.includes('USD'));
      if (opt && sel.value !== opt.value) { sel.value = opt.value; sel.dispatchEvent(new Event('change')); return 'changed'; }
    }
    // Buton tabanlı seçici
    const btn = Array.from(document.querySelectorAll('button,[role="button"]'))
      .find(b => b.innerText?.includes('USD'));
    if (btn) { btn.click(); return 'clicked'; }
    return 'not_found';
  });
  
  if (currencyUSD !== 'not_found') await new Promise(r => setTimeout(r, 2000));
  
  // Tabloları çek
  const data = await page.evaluate(() => {
    const result = { financial: null, passengers: null, currency: null };
    
    // Para birimi göstergesini al
    const currDisplay = document.querySelector('[data-currency-display],[class*="currency"]');
    result.currency = currDisplay?.innerText?.trim() || 
      document.body.innerText.match(/USD|EUR|GBP|JPY|CNY|QAR|SAR/)?.[0] || 'USD';
    
    const tables = Array.from(document.querySelectorAll('table'));
    
    tables.forEach(t => {
      const rows = Array.from(t.querySelectorAll('tr'));
      if (!rows.length) return;
      const headers = Array.from(rows[0].querySelectorAll('th,td')).map(c=>c.innerText.trim());
      
      // Finansal tablo: "Annual Financial Results" veya "Total Revenue" içeriyor
      const isFinancial = headers[0]?.includes('Financial') || 
        rows.some(r => r.innerText.includes('Revenue'));
      // Yolcu tablosu: "Annual Passenger" veya "Passengers" içeriyor  
      const isPax = headers[0]?.includes('Passenger') || 
        rows.some(r => r.innerText.includes('Load Factor'));
      
      const tableData = {
        years: headers.slice(1),
        rows: {}
      };
      
      rows.slice(1).forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (!cells.length) return;
        const label = cells[0]?.innerText.trim();
        if (!label) return;
        const values = cells.slice(1).map(c => c.innerText.trim());
        tableData.rows[label] = values;
      });
      
      if (isFinancial && !result.financial) result.financial = tableData;
      if (isPax && !result.passengers) result.passengers = tableData;
    });
    
    return result;
  });
  
  return { slug: "SLUG", ...data, currencyAction: currencyUSD };
};"""

def scrape_financials(slug, name):
    code = JS_CODE.replace("SESS", CHASESSID).replace("CHARC_V", CHARC).replace("SLUG", slug).replace('"SLUG"', f'"{slug}"')
    req = urllib.request.Request(BL_URL, data=code.encode(), 
                                  headers={"Content-Type":"application/javascript"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=75) as r:
            resp = json.loads(r.read())
        has_fin = bool(resp.get("financial") and resp["financial"].get("rows"))
        has_pax = bool(resp.get("passengers") and resp["passengers"].get("rows"))
        return {
            "slug": slug, "name": name,
            "financial": resp.get("financial"),
            "passengers": resp.get("passengers"),
            "currency": resp.get("currency", "USD"),
            "has_data": has_fin or has_pax
        }
    except Exception as e:
        return {"slug": slug, "name": name, "error": str(e), "has_data": False}

if __name__ == "__main__":
    results = {}
    for slug, name in AIRLINES:
        print(f"  → {slug} {name}...", end="", flush=True)
        r = scrape_financials(slug, name)
        results[slug] = r
        fin_years = len(r.get("financial", {}).get("years", [])) if r.get("financial") else 0
        pax_years = len(r.get("passengers", {}).get("years", [])) if r.get("passengers") else 0
        err = r.get("error", "")
        print(f" fin={fin_years}y pax={pax_years}y" + (f" ⚠{err[:30]}" if err else ""))
        time.sleep(3)
    
    out = "/Users/emre/Desktop/haberozetleri/.claude/worktrees/cool-galileo-8eb736/cha_financials.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Kaydedildi → {out}")
