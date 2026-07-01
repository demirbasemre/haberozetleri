import os
import time
import json
import subprocess
import re
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import browser_cookie3
from playwright.sync_api import sync_playwright

PORT = 5005
user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"

# Havayolları konfigürasyonu
airlines = {
    "TK": {"name": "Turkish Airlines", "slug": "Turkish-Airlines", "cargo_slug": "Turkish-Cargo", "cargo_mode": "SUBSET_A330"},
    "EK": {"name": "Emirates", "slug": "Emirates", "cargo_slug": "Emirates-SkyCargo", "cargo_mode": "NONE"},
    "CX": {"name": "Cathay Pacific", "slug": "Cathay-Pacific", "cargo_slug": "Cathay-Cargo", "cargo_mode": "SUBSET_B747"},
    "CK": {"name": "China Cargo Airlines", "slug": "China-Cargo-Airlines", "cargo_mode": "ALL_CARGO"},
    "QR": {"name": "Qatar Airways", "slug": "Qatar-Airways", "cargo_slug": "Qatar-Airways-Cargo", "cargo_mode": "NONE"},
    "LH": {"name": "Lufthansa", "slug": "Lufthansa", "cargo_slug": "Lufthansa-Cargo", "cargo_mode": "ADDITIVE"},
    "AFKLM": {"name": "Air France-KLM", "slug": "Air-France-KLM", "cargo_mode": "NONE"},
    "KE": {"name": "Korean Air", "slug": "Korean-Air", "cargo_mode": "NONE"},
    "CV": {"name": "Cargolux", "slug": "Cargolux-Airlines-International", "cargo_mode": "ALL_CARGO"},
    "LA": {"name": "LATAM Airlines", "slug": "LATAM-Airlines-Group", "cargo_slugs": ["LATAM-Cargo-Chile", "LATAM-Cargo-Brasil"], "cargo_mode": "ADDITIVE_LATAM"},
    "CI": {"name": "China Airlines", "slug": "China-Airlines", "cargo_mode": "CI_SPECIAL"},
    "CZ": {"name": "China Southern", "slug": "China-Southern-Airlines", "cargo_mode": "NONE"},
    "CA": {"name": "Air China", "slug": "Air-China", "cargo_slug": "Air-China-Cargo", "cargo_mode": "ADDITIVE"},
    "SQ": {"name": "Singapore Airlines", "slug": "Singapore-Airlines", "cargo_slug": "Singapore-Airlines-Cargo", "cargo_mode": "SUBSET_B747"}
}

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

import re

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
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/api/update-fleet':
            content_length = int(self.headers['Content-Length'] or 0)
            post_data = self.rfile.read(content_length)
            
            req_cookies = []
            req_password = ""
            try:
                if post_data:
                    req_json = json.loads(post_data.decode('utf-8'))
                    manual_cookie_str = req_json.get("cookies", "")
                    req_password = req_json.get("password", "")
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

            # Şifre Doğrulaması
            expected_pwd = os.environ.get('FLEET_UPDATE_PASSWORD', '[KALDIRILDI]')
            if req_password != expected_pwd:
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized", "message": "Geçersiz şifre girdiniz."}).encode('utf-8'))
                return

            # Çerezleri birleştir (öncelik kullanıcının gönderdiğinde)
            cookies = req_cookies if req_cookies else get_chrome_cookies()
            
            if not cookies:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No valid cookies", "message": "Geçerli çerez bulunamadı. Lütfen Chrome'dan kopyalayıp çerez paneline yapıştırın."}).encode('utf-8'))
                return

            # Scraping işlemini çalıştır
            try:
                result = self.process_scraping(cookies)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                print(f"Scraping error: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "ServerError", "message": str(e)}).encode('utf-8'))

        else:
            self.send_response(404)
            self.end_headers()

    def process_scraping(self, cookies):
        workspace_dir = "/Users/emre/Desktop/haberozetleri"
        fleet_json_path = os.path.join(workspace_dir, "data/fleet.json")
        history_dir = os.path.join(workspace_dir, "data/history")
        history_index_path = os.path.join(workspace_dir, "data/history_index.json")
        
        # Mevcut veriyi yükle
        with open(fleet_json_path, "r", encoding="utf-8") as f:
            fleet_data = json.load(f)

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
                user_agent=user_agent,
                viewport={"width": 1440, "height": 900},
                locale="en-US"
            )
            context.add_cookies(cookies)
            page = context.new_page()
            page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            for code, info in airlines.items():
                print(f"\nScraping {info['name']} ({code})...")
                url = f"https://www.planespotters.net/airline/{info['slug']}"
                
                # Önceki taranan "last updated" tarihini al
                last_stored_date = fleet_data.get(code, {}).get("planespotters_last_updated")
                
                try:
                    types, page_last_updated = extract_fleet(page, url, last_stored_date)
                    
                    if types is None:
                        # Güncelleme tarihi değişmemiş, atla
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

        # fleet.json'ı güncelle
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
            
            fleet_data[code]["types"] = new_types
            fleet_data[code]["ca"] = ca
            fleet_data[code]["ci"] = ci
            fleet_data[code]["ct"] = ct
            fleet_data[code]["co"] = co
            fleet_data[code]["pt"] = ct
            fleet_data[code]["po"] = co
            fleet_data[code]["k1age"] = k1age
            fleet_data[code]["planespotters_last_updated"] = page_last_updated
            
        with open(fleet_json_path, "w", encoding="utf-8") as f:
            json.dump(fleet_data, f, indent=1, ensure_ascii=False)
            
        # 4. Tarihsel yedeği kaydet
        today_str = datetime.now().strftime("%Y-%m-%d")
        history_file_path = os.path.join(history_dir, f"{today_str}.json")
        
        # fleet.json kopyasını kaydet
        with open(history_file_path, "w", encoding="utf-8") as f:
            json.dump(fleet_data, f, indent=1, ensure_ascii=False)
            
        # Tarih indeksini güncelle
        history_index = []
        if os.path.exists(history_index_path):
            with open(history_index_path, "r", encoding="utf-8") as f:
                history_index = json.load(f)
        if today_str not in history_index:
            history_index.append(today_str)
            with open(history_index_path, "w", encoding="utf-8") as f:
                json.dump(history_index, f, indent=1, ensure_ascii=False)

        # 5. Cloudflare Workers KV'ye Gönder
        print("Veriler Cloudflare Workers KV'ye gönderiliyor...")
        cf_url = "https://api-fleet.emredemirbas.com/api/save-fleet"
        payload = {
            "password": expected_pwd,
            "fleet": fleet_data,
            "date": today_str
        }
        try:
            import urllib.request
            req = urllib.request.Request(
                cf_url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                res_body = response.read().decode('utf-8')
                print(f"Cloudflare Workers yanıtı: {res_body}")
        except Exception as cf_err:
            print(f"Cloudflare KV güncelleme hatası: {cf_err}")

        return {"status": "success", "updated": updated_list, "skipped": skipped_list}

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
