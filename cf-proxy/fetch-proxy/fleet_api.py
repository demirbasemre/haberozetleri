import os
import time
import json
import re
import random
import threading
import urllib.request
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import browser_cookie3
from playwright.sync_api import sync_playwright

PORT = 5005

# Uçak listesi arka plan tarama durumu
AC_STATE = {"running": False, "result": None, "error": None, "started_at": None}
API_BASE = os.environ.get('FLEET_API_BASE', 'https://api-fleet.emredemirbas.com')
# FlareSolverr: planespotters'ın Cloudflare + site-içi Turnstile katmanını geçmek için.
# Uçak listesi (tescil bazlı) YALNIZCA bu yolla çekilir; matris hâlâ Playwright kullanır.
FLARESOLVERR_URL = os.environ.get('FLARESOLVERR_URL', 'http://192.168.3.100:8191/v1')
user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"

# Havayolları konfigürasyonu
airlines = {
    "TK": {"name": "Turkish Airlines", "slug": "Turkish-Airlines", "cargo_slug": "Turkish-Cargo", "cargo_mode": "SUBSET_A330", "color": "#E30613"},
    "EK": {"name": "Emirates", "slug": "Emirates", "cargo_slug": "Emirates-SkyCargo", "cargo_mode": "NONE", "color": "#F59E0B"},
    "CX": {"name": "Cathay Pacific", "slug": "Cathay-Pacific", "cargo_slug": "Cathay-Cargo", "cargo_mode": "SUBSET_B747", "color": "#1D6FE8"},
    "CK": {"name": "China Cargo Airlines", "slug": "China-Cargo-Airlines", "cargo_mode": "ALL_CARGO", "color": "#8b5cf6"},
    "QR": {"name": "Qatar Airways", "slug": "Qatar-Airways", "cargo_slug": "Qatar-Airways-Cargo", "cargo_mode": "NONE", "color": "#7C3AED"},
    "LH": {"name": "Lufthansa", "slug": "Lufthansa", "cargo_slug": "Lufthansa-Cargo", "cargo_mode": "ADDITIVE", "color": "#374151"},
    "AFKLM": {"name": "Air France-KLM", "slug": "Air-France-KLM", "cargo_mode": "NONE", "color": "#059669"},
    "KE": {"name": "Korean Air", "slug": "Korean-Air", "cargo_mode": "NONE", "color": "#1a3a8f"},
    "CV": {"name": "Cargolux", "slug": "Cargolux-Airlines-International", "cargo_mode": "ALL_CARGO", "color": "#6B7280"},
    "LA": {"name": "LATAM Airlines", "slug": "LATAM-Airlines-Group", "cargo_slugs": ["LATAM-Cargo-Chile", "LATAM-Cargo-Brasil"], "cargo_mode": "ADDITIVE_LATAM", "color": "#059669"},
    "CI": {"name": "China Airlines", "slug": "China-Airlines", "cargo_mode": "CI_SPECIAL", "color": "#0891B2"},
    "CZ": {"name": "China Southern", "slug": "China-Southern-Airlines", "cargo_mode": "NONE", "color": "#2563EB"},
    "CA": {"name": "Air China", "slug": "Air-China", "cargo_slug": "Air-China-Cargo", "cargo_mode": "ADDITIVE", "color": "#DC2626"},
    "SQ": {"name": "Singapore Airlines", "slug": "Singapore-Airlines", "cargo_slug": "Singapore-Airlines-Cargo", "cargo_mode": "SUBSET_B747", "color": "#0f4c8a"},
    "MU": {"name": "China Eastern", "slug": "China-Eastern-Airlines", "cargo_slug": "China-Eastern-Cargo", "cargo_mode": "ADDITIVE", "color": "#014099"},
    "EY": {"name": "Etihad Airways", "slug": "Etihad-Airways", "cargo_slug": "Etihad-Cargo", "cargo_mode": "ADDITIVE", "color": "#c4a45c"},
    "3S": {"name": "AeroLogic", "slug": "AeroLogic", "cargo_mode": "ALL_CARGO", "color": "#ffcc00"},
    "ZETA": {"name": "AirZeta", "slug": "AirZeta", "cargo_mode": "ALL_CARGO", "color": "#0099cc"},
    "N8": {"name": "National Airlines", "slug": "National-Airlines", "cargo_mode": "NONE", "color": "#003366"},
    "CC": {"name": "CMA CGM", "slug": "CMA-CGM-Air-Cargo", "cargo_mode": "ALL_CARGO", "color": "#002d72"},
    "3U": {"name": "Sichuan Airlines", "slug": "Sichuan-Airlines", "cargo_mode": "NONE", "color": "#e3001b"},
    "AV": {"name": "Avianca", "slug": "Avianca", "cargo_slug": "Avianca-Cargo", "cargo_mode": "ADDITIVE", "color": "#dc241f"},
    "ABD": {"name": "Air Atlanta", "slug": "Air-Atlanta-Icelandic", "cargo_mode": "ALL_CARGO", "color": "#1a5c3a"}
}

def api_get(path):
    req = urllib.request.Request(API_BASE + path, headers={'User-Agent': user_agent})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode('utf-8'))

def api_post(path, payload):
    req = urllib.request.Request(
        API_BASE + path,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': user_agent},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode('utf-8'))

def get_chrome_cookies():
    try:
        cj = browser_cookie3.chrome(domain_name='planespotters.net')
        cookies = []
        for cookie in cj:
            c = {
                'name': cookie.name,
                'value': cookie.value,
                'domain': cookie.domain,
                'path': cookie.path,
                'secure': bool(cookie.secure)
            }
            if cookie.expires:
                c['expires'] = float(cookie.expires)
            cookies.append(c)
        return cookies
    except Exception as e:
        print(f"browser_cookie3 hata: {e}")
        return []

def clean_age(age_str):
    age_str = age_str.replace("Years", "").replace("Year", "").strip()
    try:
        val = float(age_str)
        return str(val)
    except ValueError:
        return ""

def classify_variant_name(v):
    v = v.replace("Airbus ", "").replace("Boeing ", "B")
    if v.startswith("AA"):
        v = "A" + v[2:]

    if "787-9 Dreamliner" in v or "787-9" in v:
        v = "B787-9"
    elif "787-10 Dreamliner" in v or "787-10" in v:
        v = "B787-10"
    elif "737 MAX 8" in v or "737-8 MAX" in v:
        v = "B737-8"
    elif "737 MAX 9" in v or "737-9 MAX" in v:
        v = "B737-9"
    elif "777-200" in v:
        v = "B777-200"
    elif "737-900" in v:
        v = "B737-900"
    elif "COMAC ARJ21-700 / C909-700" in v or "ARJ21-700" in v:
        v = "ARJ21-700"
    elif "COMAC C919-100" in v or "C919-100" in v:
        v = "C919-100"
    return v

def merge_types(types_list):
    merged = {}
    for t in types_list:
        v = t["v"]
        if v not in merged:
            merged[v] = {
                "v": v, "a": 0, "i": 0, "w": "", "t": 0, "o": 0, "age_weighted_sum": 0.0, "age_count": 0
            }
        merged[v]["a"] += int(t["a"] or 0)
        merged[v]["i"] += int(t["i"] or 0)
        merged[v]["t"] += int(t["t"] or 0)
        merged[v]["o"] += int(t["o"] or 0)
        if t["age"]:
            try:
                age_val = float(t["age"])
                t_val = int(t["t"] or 0)
                merged[v]["age_weighted_sum"] += age_val * t_val
                merged[v]["age_count"] += t_val
            except ValueError:
                pass

    result = []
    for v, info in merged.items():
        age_str = ""
        if info["age_count"] > 0:
            age_str = str(round(info["age_weighted_sum"] / info["age_count"], 1))
        result.append({
            "v": info["v"],
            "a": str(info["a"]) if info["a"] > 0 else "",
            "i": str(info["i"]) if info["i"] > 0 else "",
            "w": "",
            "t": str(info["t"]) if info["t"] > 0 else "",
            "o": str(info["o"]) if info["o"] > 0 else "",
            "age": age_str
        })
    return result

def get_last_updated_date(page):
    try:
        # Planespotters "Last updated on Month DD, YYYY" metnini okur
        text = page.evaluate("() => document.body.innerText")
        match = re.search(r"Last updated on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})", text)
        if match:
            return match.group(1).strip()
    except Exception as e:
        print(f"Güncelleme tarihi okunamadı: {e}")
    return None

def extract_fleet(page, url, last_stored_date=None):
    print(f"Sayfa açılıyor: {url}")
    page.goto(url, wait_until="networkidle", timeout=60000)
    time.sleep(2)

    title = page.title()
    if "Cloudflare" in title or "Attention Required" in title or "Blocked" in title:
        raise Exception(f"Cloudflare Engeline Takıldı: {title}")

    # Last updated tarihini kontrol et
    page_last_updated = get_last_updated_date(page)
    print(f"Planespotters Son Güncelleme Tarihi: {page_last_updated}")

    if last_stored_date and page_last_updated and last_stored_date == page_last_updated:
        print(">> Sayfa son taranan tarihle aynı. Tarama atlanıyor (Hızlı Geçiş).")
        return None, page_last_updated

    # JS Extraction
    js_code = """
    () => {
        let matrixTable = null;
        document.querySelectorAll('table').forEach(t=>{ if(t.innerText.includes('Aircraft Type') && t.innerText.includes('In Service')) matrixTable = t; });
        if(!matrixTable) return null;
        const rows = matrixTable.querySelectorAll('tbody tr');
        let result = [];
        rows.forEach(tr=>{
          const isSub = tr.classList.contains('subtype');
          const th = tr.querySelector('th');
          const label = th ? th.textContent.trim() : '';
          const tds = Array.from(tr.querySelectorAll('td')).map(td=>td.textContent.trim());
          if(isSub && (tds[0]||tds[1]||tds[2]) && !label.includes('Bombardier') && !label.includes('Gulfstream')){
            result.push([label, tds[0], tds[1], tds[2], tds[3], tds[4], tds[5], tds[6]]);
          }
        });
        return result;
    }
    """
    data = page.evaluate(js_code)
    if not data:
        return [], page_last_updated

    parsed_types = []
    for row in data:
        raw_v, active, parked, current, future, historic, age, total = row
        v_name = classify_variant_name(raw_v)
        parsed_types.append({
            "v": v_name,
            "a": active if active else "",
            "i": parked if parked else "",
            "w": "",
            "t": current if current else "",
            "o": future if future else "",
            "age": clean_age(age)
        })
    return parsed_types, page_last_updated

# ── Uçak Listesi (tescil bazlı Fleet List, FlareSolverr üzerinden) ──────────
# planespotters fleet list sayfası div-tabanlı "data table" (.dt-tr/.dt-td/.dt-th)
# kullanır ve Cloudflare + site-içi Turnstile ile korunur. FlareSolverr her iki
# katmanı da geçer (challenge çözer); kullanıcının çerezleri Turnstile için şart.

# İnsan benzeri, nazik gecikmeler (kişisel kullanım — planespotters'a yük bindirmemek
# ve bot tespitini azaltmak için). Ticari amaç yok.
PAGE_DELAY = (3.0, 7.0)      # aynı havayolunun sayfaları arası
AIRLINE_DELAY = (6.0, 14.0)  # havayolları arası
RETRY_DELAY = (8.0, 16.0)    # geçici hata (500 vb.) sonrası tekrar denemeden önce

def _nap(rng):
    time.sleep(random.uniform(*rng))

def flaresolverr_get(url, cookies_list, timeout_ms=80000, retries=2):
    """FlareSolverr üzerinden URL'i çeker, HTML döner. Geçici hatada bekleyip tekrar dener."""
    payload = {"cmd": "request.get", "url": url, "maxTimeout": timeout_ms}
    if cookies_list:
        payload["cookies"] = cookies_list
    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(
                FLARESOLVERR_URL,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=(timeout_ms / 1000) + 20) as r:
                resp = json.loads(r.read().decode('utf-8'))
            sol = resp.get("solution", {})
            html = sol.get("response", "") or ""
            # Veri limiti sayfası 200 döner ama içerik yoktur — boş liste sanılmasın diye yakala
            if "Data Limit Reached" in html or "data access limit" in html:
                raise Exception("DATA_LIMIT: planespotters 24 saatlik veri erişim limiti dolu")
            if "Security Verification" in html or "Attention Required" in html or sol.get("status") != 200:
                raise Exception(f"Cloudflare/Turnstile geçilemedi (http {sol.get('status')})")
            return html
        except Exception as e:
            last_err = e
            if attempt < retries:
                print(f"[AC] Geçici hata ({e}) — tekrar deneniyor ({attempt + 1}/{retries})...", flush=True)
                _nap(RETRY_DELAY)
    raise Exception(f"{last_err} (çerezler geçersiz/süresi dolmuş olabilir veya sunucu geçici yük altında)")

def _dt_cells(block, cls):
    """block içinden verilen .dt-* sınıfına ait hücrelerin düz metnini (boşlar dahil) döndürür."""
    out = []
    for m in re.finditer(r'<div class="' + cls + r'\b[^"]*"[^>]*>(.*?)</div>', block, re.S):
        txt = re.sub(r'<[^>]+>', ' ', m.group(1))
        out.append(re.sub(r'\s+', ' ', txt).strip())
    return out

def parse_aircraft_page(html):
    """Fleet list HTML'inden (heads, satır dict listesi, maxPage) döndürür."""
    heads = _dt_cells(html, 'dt-th')  # foto/ikon başlıkları boş string olarak dahil (hizalama için)
    rows = []
    trs = re.split(r'<div class="dt-tr', html)
    for tr in trs[1:]:
        tds = _dt_cells('<div class="dt-tr' + tr, 'dt-td')
        if not tds:
            continue
        rec = {}
        for h, v in zip(heads, tds):
            hl = h.lower()
            if not h:
                continue
            if hl == 'reg':
                rec['reg'] = v
            elif 'aircraft type' in hl or hl == 'type':
                rec['type'] = v
            elif 'config' in hl:
                rec['config'] = v
            elif 'deliver' in hl:
                rec['delivered'] = v
            elif 'remark' in hl:
                rec['remark'] = v
            elif 'name' in hl:
                rec['name'] = v
            elif 'age' in hl:
                rec['age'] = clean_age(v)
        if rec.get('reg'):
            rows.append(rec)
    max_page = max([int(x) for x in re.findall(r'[?&]page=(\d+)', html)] + [1])
    return heads, rows, max_page

def parse_last_updated(html):
    """Fleet list sayfasındaki 'Last updated on Jul 02, 2026' tarihini döndürür."""
    m = re.search(r"Last updated on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})", html)
    return m.group(1).strip() if m else None

def extract_aircraft_list(slug, cookies_list, last_stored=None):
    """Havayolunun tescil bazlı uçak listesini FlareSolverr ile çeker.
    Dönüş: (aircrafts | None, page_updated, page_error).
    - aircrafts None ise: sayfa 'Last updated' tarihi KV'dekiyle aynı → değişmemiş, atla.
    - page_error True ise: bazı sayfalar çekilemedi (liste eksik olabilir, tarihi yazma)."""
    base = f"https://www.planespotters.net/fleet/list/{slug}/current"
    html = flaresolverr_get(base, cookies_list)
    page_updated = parse_last_updated(html)

    # Bir önceki taramadan sonra güncellenmediyse hiç sayfa çekmeden atla (kota tasarrufu)
    if last_stored and page_updated and last_stored == page_updated:
        print(f"{slug}: değişmemiş (Last updated {page_updated}) — atlanıyor", flush=True)
        return None, page_updated, False

    heads, rows, max_page = parse_aircraft_page(html)
    if not [h for h in heads if h.lower() == 'reg']:
        print(f"[UYARI] {slug}: 'Reg' sütunu bulunamadı, yapı değişmiş olabilir. Başlıklar: {heads}", flush=True)
    print(f"{slug} uçak listesi: {[h for h in heads if h]} — {max_page} sayfa (Last updated {page_updated})", flush=True)
    aircrafts = list(rows)

    page_error = False
    for pno in range(2, max_page + 1):
        _nap(PAGE_DELAY)  # sayfalar arası nazik bekleme
        try:
            html = flaresolverr_get(f"{base}?page={pno}", cookies_list)
            _, rows, _ = parse_aircraft_page(html)
            aircrafts.extend(rows)
        except Exception as e:
            page_error = True
            print(f"[UYARI] {slug} sayfa {pno}: {e}", flush=True)
    return aircrafts, page_updated, page_error

def cookie_str_to_flaresolverr(cookie_str):
    """'a=b; c=d' çerez dizesini FlareSolverr cookie formatına çevirir."""
    out = []
    for part in (cookie_str or "").split(";"):
        if "=" in part:
            name, value = part.strip().split("=", 1)
            if name:
                out.append({"name": name, "value": value, "domain": ".planespotters.net"})
    return out

class FleetAPIHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Proxy-Token')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "running", "service": "Antigravity Fleet Scraper API"}).encode('utf-8'))
        elif self.path == '/api/aircraft-status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(AC_STATE).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def _json_response(self, status, payload):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def _parse_auth_and_cookies(self):
        """Body'den şifre + çerez + UA okur; hata durumunda yanıtı yazar ve None döner."""
        content_length = int(self.headers['Content-Length'] or 0)
        post_data = self.rfile.read(content_length)

        req_cookies = []
        req_password = ""
        req_ua = ""
        try:
            if post_data:
                req_json = json.loads(post_data.decode('utf-8'))
                manual_cookie_str = req_json.get("cookies", "")
                req_password = req_json.get("password", "")
                # cf_clearance UA'ya bağlıdır — çerezin geldiği tarayıcının UA'sı kullanılmalı
                req_ua = (req_json.get("ua") or "").strip()
                if manual_cookie_str:
                    # Manuel çerez dizesini parse et
                    for part in manual_cookie_str.split(";"):
                        if "=" in part:
                            name, value = part.strip().split("=", 1)
                            req_cookies.append({
                                "name": name, "value": value,
                                "domain": ".planespotters.net", "path": "/", "secure": True
                            })
                    print(f"Kullanıcıdan {len(req_cookies)} adet manuel çerez alındı.")
        except Exception as e:
            print(f"POST body okuma hatası: {e}")

        # Şifre Doğrulaması — yalnızca ortam değişkeninden okunur
        expected_pwd = os.environ.get('FLEET_UPDATE_PASSWORD')
        if not expected_pwd:
            self._json_response(500, {"error": "ConfigError", "message": "FLEET_UPDATE_PASSWORD ortam değişkeni ayarlanmamış."})
            return None
        if req_password != expected_pwd:
            self._json_response(401, {"error": "Unauthorized", "message": "Geçersiz şifre girdiniz."})
            return None

        # Çerezleri birleştir (öncelik kullanıcının gönderdiğinde)
        cookies = req_cookies if req_cookies else get_chrome_cookies()
        if not cookies:
            self._json_response(400, {"error": "No valid cookies", "message": "Geçerli çerez bulunamadı. Lütfen Chrome'dan kopyalayıp çerez paneline yapıştırın."})
            return None
        return cookies, expected_pwd, req_ua or user_agent

    def do_POST(self):
        if self.path == '/api/update-fleet':
            auth = self._parse_auth_and_cookies()
            if not auth:
                return
            cookies, pwd, ua = auth
            try:
                result = self.process_scraping(cookies, pwd, ua)
                self._json_response(200, result)
            except Exception as e:
                print(f"Scraping error: {e}")
                self._json_response(500, {"error": "ServerError", "message": str(e)})

        elif self.path == '/api/update-aircrafts':
            if AC_STATE["running"]:
                self._json_response(409, {"error": "Busy", "message": "Uçak listesi taraması zaten sürüyor."})
                return
            auth = self._parse_auth_and_cookies()
            if not auth:
                return
            cookies, pwd, ua = auth
            AC_STATE.update({"running": True, "result": None, "error": None,
                             "started_at": datetime.now().isoformat(timespec='seconds')})
            t = threading.Thread(target=run_aircraft_scraping, args=(cookies, pwd), daemon=True)
            t.start()
            self._json_response(202, {"status": "started", "message": "Uçak listesi taraması arka planda başlatıldı."})

        else:
            self.send_response(404)
            self.end_headers()

    def process_scraping(self, cookies, pwd, ua=None):
        # Mevcut veriyi KV'den yükle (yerel dosya bağımlılığı yok)
        fleet_data = api_get('/api/get-fleet')
        if not isinstance(fleet_data, dict) or not fleet_data or "airlines" in fleet_data:
            raise Exception("KV'den mevcut filo verisi alınamadı (get-fleet boş döndü).")

        updated_count = 0
        all_results = {}
        updated_list = []
        skipped_list = []

        with sync_playwright() as p:
            browserless_url = os.environ.get('BROWSERLESS_URL')
            if browserless_url:
                print(f"Browserless bağlantısı kuruluyor: {browserless_url}")
                browser = p.chromium.connect_over_cdp(browserless_url)
            else:
                browser = p.chromium.launch(headless=True)

            context = browser.new_context(
                user_agent=ua or user_agent,
                viewport={"width": 1440, "height": 900},
                locale="en-US"
            )
            context.add_cookies(cookies)
            page = context.new_page()
            page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

            for code, info in airlines.items():
                print(f"\nScraping {info['name']} ({code})...", flush=True)
                url = f"https://www.planespotters.net/airline/{info['slug']}"

                # Önceki taranan "last updated" tarihini al
                last_stored_date = fleet_data.get(code, {}).get("planespotters_last_updated")

                try:
                    types, page_last_updated = extract_fleet(page, url, last_stored_date)

                    if types is None:
                        # Güncelleme tarihi değişmemiş, matris taraması atla
                        skipped_list.append({"code": code, "name": info["name"], "date": page_last_updated})
                        continue

                    mode = info.get("cargo_mode")
                    if mode == "ALL_CARGO":
                        for t in types:
                            if not t["v"].endswith("(F)"):
                                t["v"] += "(F)"
                    elif mode == "SUBSET_A330":
                        new_types = []
                        for t in types:
                            if t["v"] == "A330-200":
                                new_types.append({
                                    "v": "A330-200(F)", "a": "10", "i": "", "w": "", "t": "10", "o": "", "age": t["age"]
                                })
                                tot = int(t["t"] or 0)
                                act = int(t["a"] or 0)
                                park = int(t["i"] or 0)
                                new_types.append({
                                    "v": "A330-200",
                                    "a": str(act - 10) if act - 10 > 0 else "",
                                    "i": str(park) if park > 0 else "",
                                    "w": "",
                                    "t": str(tot - 10) if tot - 10 > 0 else "",
                                    "o": t["o"],
                                    "age": t["age"]
                                })
                            else:
                                new_types.append(t)
                        types = new_types
                    elif mode == "SUBSET_B747":
                        for t in types:
                            if t["v"] in ["B747-400", "B747-8"]:
                                t["v"] += "(F)"
                    elif mode == "ADDITIVE":
                        cargo_url = f"https://www.planespotters.net/airline/{info['cargo_slug']}"
                        try:
                            cargo_types, _ = extract_fleet(page, cargo_url)
                            if cargo_types:
                                for ct in cargo_types:
                                    if not ct["v"].endswith("(F)") and not ct["v"].endswith("F"):
                                        ct["v"] += "(F)"
                                    elif ct["v"].endswith("F") and not ct["v"].endswith("(F)"):
                                        ct["v"] = ct["v"][:-1] + "(F)"
                                types.extend(cargo_types)
                        except Exception as e:
                            print(f"Kargo çekilemedi: {e}")
                    elif mode == "ADDITIVE_LATAM":
                        for c_slug in info["cargo_slugs"]:
                            cargo_url = f"https://www.planespotters.net/airline/{c_slug}"
                            try:
                                cargo_types, _ = extract_fleet(page, cargo_url)
                                if cargo_types:
                                    for ct in cargo_types:
                                        if not ct["v"].endswith("(F)") and not ct["v"].endswith("F"):
                                            ct["v"] += "(F)"
                                        elif ct["v"].endswith("F"):
                                            ct["v"] = ct["v"][:-1] + "(F)"
                                    types.extend(cargo_types)
                            except Exception as e:
                                print(f"LATAM Kargo çekilemedi: {e}")
                    elif mode == "CI_SPECIAL":
                        for t in types:
                            if t["v"] == "B747-400":
                                t["v"] = "B747-400(F)"

                    types = merge_types(types)
                    all_results[code] = {
                        "types": types,
                        "planespotters_last_updated": page_last_updated
                    }
                    updated_count += 1
                    updated_list.append({"code": code, "name": info["name"], "date": page_last_updated})
                except Exception as e:
                    print(f"[KRİTİK HATA] {code} çekilemedi: {e}")

            browser.close()

        if updated_count == 0:
            return {"status": "success", "updated": [], "skipped": skipped_list, "message": "Tüm havayolu filoları zaten güncel."}

        # fleet verisini bellekte güncelle
        for code, data in all_results.items():
            new_types = data["types"]
            page_last_updated = data["planespotters_last_updated"]

            ca = sum(int(t.get("a") or 0) for t in new_types)
            ci = sum(int(t.get("i") or 0) for t in new_types)
            ct = sum(int(t.get("t") or 0) for t in new_types)
            co = sum(int(t.get("o") or 0) for t in new_types)

            total_age_sum = 0.0
            total_count = 0
            for t in new_types:
                t_val = int(t.get("t") or 0)
                age_str = t.get("age", "").strip()
                if t_val > 0 and age_str:
                    try:
                        total_age_sum += float(age_str) * t_val
                        total_count += t_val
                    except ValueError:
                        pass
            k1age = round(total_age_sum / total_count, 1) if total_count > 0 else None

            if code not in fleet_data:
                fleet_data[code] = {
                    "name": info["name"],
                    "color": info.get("color", "#64748b")
                }
            fleet_data[code]["types"] = new_types
            fleet_data[code]["ca"] = ca
            fleet_data[code]["ci"] = ci
            fleet_data[code]["ct"] = ct
            fleet_data[code]["co"] = co
            fleet_data[code]["pt"] = ct
            fleet_data[code]["po"] = co
            fleet_data[code]["k1age"] = k1age
            fleet_data[code]["planespotters_last_updated"] = page_last_updated

        # Cloudflare Workers KV'ye gönder (tek yazma noktası)
        today_str = datetime.now().strftime("%Y-%m-%d")
        payload = {
            "password": pwd,
            "fleet": fleet_data,
            "date": today_str
        }
        print("Veriler Cloudflare Workers KV'ye gönderiliyor...")
        cf_res = api_post('/api/save-fleet', payload)
        print(f"Cloudflare Workers yanıtı: {cf_res}")

        return {"status": "success", "updated": updated_list, "skipped": skipped_list}

def run_aircraft_scraping(cookies, pwd):
    """Tüm havayollarının tescil bazlı uçak listesini FlareSolverr ile tarar ve KV'ye yazar.
    Arka plan thread'inde çalışır; durum AC_STATE üzerinden izlenir.
    cookies: playwright formatı liste; FlareSolverr için name/value/domain'e indirgenir."""
    try:
        per_airline = {}
        errors = []
        skipped = []
        fs_cookies = [{"name": c["name"], "value": c["value"],
                       "domain": c.get("domain", ".planespotters.net")} for c in cookies]

        # Mevcut KV verisini yükle: havayolu bazında kayıtlar + son 'Last updated' tarihi
        try:
            existing = api_get('/api/get-aircrafts')
            if not isinstance(existing, list):
                existing = []
        except Exception:
            existing = []
        existing_by = {}
        existing_updated = {}
        for a in existing:
            code = a.get("airline")
            if not code:
                continue
            existing_by.setdefault(code, []).append(a)
            if a.get("updated") and code not in existing_updated:
                existing_updated[code] = a["updated"]

        kept = {}  # code -> uçak kayıtları listesi (yeni taranan, korunan veya atlanan)

        for idx, (code, info) in enumerate(airlines.items()):
            if idx > 0:
                _nap(AIRLINE_DELAY)  # havayolları arası nazik bekleme
            print(f"\n[AC] Uçak listesi taranıyor: {info['name']} ({code})...", flush=True)
            try:
                ac_list, page_updated, page_error = extract_aircraft_list(
                    info['slug'], fs_cookies, existing_updated.get(code))

                if ac_list is None:
                    # 'Last updated' değişmemiş → mevcut KV verisini olduğu gibi koru
                    kept[code] = existing_by.get(code, [])
                    skipped.append(code)
                    per_airline[code] = len(kept[code])
                    continue

                if (page_error or len(ac_list) == 0) and existing_by.get(code):
                    # Kısmi (bazı sayfalar düştü) VEYA boş sonuç + eski veri var → eskiyi koru
                    kept[code] = existing_by[code]
                    per_airline[code] = len(kept[code])
                    errors.append(f"{code}: eksik/boş sonuç, eski veri korundu")
                    print(f"[AC] {code}: eksik/boş sonuç → eski veri korundu ({len(kept[code])})", flush=True)
                    continue

                for rec in ac_list:
                    rec["airline"] = code
                    rec["airlineName"] = info["name"]
                    # Kısmi tarama olduysa tarihi yazma ki sonraki sefer yeniden denesin
                    rec["updated"] = "" if page_error else (page_updated or "")
                kept[code] = ac_list
                per_airline[code] = len(ac_list)
                print(f"[AC] {code}: {len(ac_list)} uçak", flush=True)
            except Exception as e:
                # Çekilemedi (limit/Cloudflare/çerez) → varsa eski veriyi koru (merge koruması)
                if existing_by.get(code):
                    kept[code] = existing_by[code]
                    per_airline[code] = len(kept[code])
                    errors.append(f"{code}: {e} (eski veri korundu)")
                    print(f"[AC][HATA] {code} çekilemedi, eski veri korundu: {e}", flush=True)
                else:
                    per_airline[code] = 0
                    errors.append(f"{code}: {e}")
                    print(f"[AC][HATA] {code} çekilemedi ve eski veri yok: {e}", flush=True)

        # Birleştir: yapılandırılmış havayolları + KV'de olup config'te olmayanlar (kaybetme)
        all_aircrafts = []
        for code in airlines.keys():
            all_aircrafts.extend(kept.get(code, []))
        for code, recs in existing_by.items():
            if code not in airlines and code not in kept:
                all_aircrafts.extend(recs)

        if not all_aircrafts:
            detail = f" İlk hata: {errors[0]}" if errors else ""
            raise Exception(f"Hiç uçak kaydı yok — çerezler geçersiz veya veri limiti dolmuş olabilir.{detail}")

        print(f"[AC] {len(all_aircrafts)} uçak kaydı KV'ye gönderiliyor "
              f"(atlanan: {len(skipped)}, hata/korunan: {len(errors)})...", flush=True)
        cf_res = api_post('/api/save-aircrafts', {"password": pwd, "aircrafts": all_aircrafts})
        print(f"[AC] Cloudflare Workers yanıtı: {cf_res}")

        AC_STATE.update({"running": False, "error": None, "result": {
            "aircraft_count": len(all_aircrafts),
            "per_airline": per_airline,
            "skipped": skipped,
            "errors": errors,
            "finished_at": datetime.now().isoformat(timespec='seconds')
        }})
    except Exception as e:
        print(f"[AC][KRİTİK] Uçak listesi taraması başarısız: {e}")
        AC_STATE.update({"running": False, "result": None, "error": str(e)})

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, FleetAPIHandler)
    print(f"Fleet API Server listening on port {PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    print("Server stopped.")

if __name__ == '__main__':
    run_server()
