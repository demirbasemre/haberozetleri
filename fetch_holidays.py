import os
import json
import urllib.request
import time

# Uçuş ağındaki ülkeler (120+ ülke)
COUNTRIES = [
    {"code": "TR", "name": "Türkiye"},
    {"code": "US", "name": "ABD"},
    {"code": "AF", "name": "Afganistan"},
    {"code": "DE", "name": "Almanya"},
    {"code": "AO", "name": "Angola"},
    {"code": "AR", "name": "Arjantin"},
    {"code": "AM", "name": "Ermenistan"},
    {"code": "AL", "name": "Arnavutluk"},
    {"code": "AU", "name": "Avustralya"},
    {"code": "AT", "name": "Avusturya"},
    {"code": "AZ", "name": "Azerbaycan"},
    {"code": "BS", "name": "Bahamalar"},
    {"code": "BH", "name": "Bahreyn"},
    {"code": "BD", "name": "Bangladeş"},
    {"code": "BE", "name": "Belçika"},
    {"code": "BJ", "name": "Benin"},
    {"code": "BY", "name": "Beyaz Rusya"},
    {"code": "BA", "name": "Bosna Hersek"},
    {"code": "BR", "name": "Brezilya"},
    {"code": "BG", "name": "Bulgaristan"},
    {"code": "BF", "name": "Burkina Faso"},
    {"code": "BI", "name": "Burundi"},
    {"code": "AE", "name": "BAE"},
    {"code": "DZ", "name": "Cezayir"},
    {"code": "DJ", "name": "Cibuti"},
    {"code": "TD", "name": "Çad"},
    {"code": "CZ", "name": "Çekya"},
    {"code": "CN", "name": "Çin"},
    {"code": "DK", "name": "Danimarka"},
    {"code": "CD", "name": "Dem. Kongo Cum."},
    {"code": "EC", "name": "Ekvador"},
    {"code": "GQ", "name": "Ekvator Ginesi"},
    {"code": "SV", "name": "El Salvador"},
    {"code": "ID", "name": "Endonezya"},
    {"code": "ER", "name": "Eritre"},
    {"code": "EE", "name": "Estonya"},
    {"code": "ET", "name": "Etiyopya"},
    {"code": "PH", "name": "Filipinler"},
    {"code": "FI", "name": "Finlandiya"},
    {"code": "FR", "name": "Fransa"},
    {"code": "GA", "name": "Gabon"},
    {"code": "GM", "name": "Gambiya"},
    {"code": "GH", "name": "Gana"},
    {"code": "GN", "name": "Gine"},
    {"code": "GW", "name": "Gine-Bissau"},
    {"code": "GT", "name": "Guatemala"},
    {"code": "ZA", "name": "Güney Afrika"},
    {"code": "KR", "name": "G. Kore"},
    {"code": "SS", "name": "Güney Sudan"},
    {"code": "GE", "name": "Gürcistan"},
    {"code": "HT", "name": "Haiti"},
    {"code": "HR", "name": "Hırvatistan"},
    {"code": "IN", "name": "Hindistan"},
    {"code": "NL", "name": "Hollanda"},
    {"code": "HK", "name": "Hong Kong"},
    {"code": "IQ", "name": "Irak"},
    {"code": "GB", "name": "İngiltere"},
    {"code": "IR", "name": "İran"},
    {"code": "IE", "name": "İrlanda"},
    {"code": "ES", "name": "İspanya"},
    {"code": "IL", "name": "İsrail"},
    {"code": "SE", "name": "İsveç"},
    {"code": "CH", "name": "İsviçre"},
    {"code": "IT", "name": "İtalya"},
    {"code": "CI", "name": "Fildişi Sahili"},
    {"code": "JP", "name": "Japonya"},
    {"code": "JO", "name": "Ürdün"},
    {"code": "KH", "name": "Kamboçya"},
    {"code": "CM", "name": "Kamerun"},
    {"code": "CA", "name": "Kanada"},
    {"code": "ME", "name": "Karadağ"},
    {"code": "QA", "name": "Katar"},
    {"code": "KZ", "name": "Kazakistan"},
    {"code": "KE", "name": "Kenya"},
    {"code": "KG", "name": "Kırgızistan"},
    {"code": "CO", "name": "Kolombiya"},
    {"code": "KM", "name": "Komorlar"},
    {"code": "CG", "name": "Kongo"},
    {"code": "XK", "name": "Kosova"},
    {"code": "CR", "name": "Kosta Rika"},
    {"code": "CU", "name": "Küba"},
    {"code": "KW", "name": "Kuveyt"},
    {"code": "CY", "name": "K.K.T.C."},
    {"code": "LV", "name": "Letonya"},
    {"code": "LR", "name": "Liberya"},
    {"code": "LY", "name": "Libya"},
    {"code": "LT", "name": "Litvanya"},
    {"code": "LU", "name": "Lüksemburg"},
    {"code": "HU", "name": "Macaristan"},
    {"code": "MG", "name": "Madagaskar"},
    {"code": "MK", "name": "Kuzey Makedonya"},
    {"code": "MY", "name": "Malezya"},
    {"code": "ML", "name": "Mali"},
    {"code": "MV", "name": "Maldivler"},
    {"code": "MT", "name": "Malta"},
    {"code": "MA", "name": "Fas"},
    {"code": "MR", "name": "Moritanya"},
    {"code": "MU", "name": "Mauritius"},
    {"code": "MX", "name": "Meksika"},
    {"code": "MD", "name": "Moldova"},
    {"code": "MN", "name": "Moğolistan"},
    {"code": "MZ", "name": "Mozambik"},
    {"code": "NP", "name": "Nepal"},
    {"code": "NE", "name": "Nijer"},
    {"code": "NG", "name": "Nijerya"},
    {"code": "NO", "name": "Norveç"},
    {"code": "CF", "name": "Orta Afrika Cum."},
    {"code": "OM", "name": "Umman"},
    {"code": "UZ", "name": "Özbekistan"},
    {"code": "PK", "name": "Pakistan"},
    {"code": "PA", "name": "Panama"},
    {"code": "PT", "name": "Portekiz"},
    {"code": "RO", "name": "Romanya"},
    {"code": "RU", "name": "Rusya"},
    {"code": "RW", "name": "Ruanda"},
    {"code": "SN", "name": "Senegal"},
    {"code": "RS", "name": "Sırbistan"},
    {"code": "SC", "name": "Seyşeller"},
    {"code": "SL", "name": "Sierra Leone"},
    {"code": "SG", "name": "Singapur"},
    {"code": "SK", "name": "Slovakya"},
    {"code": "SI", "name": "Slovenya"},
    {"code": "SO", "name": "Somali"},
    {"code": "LK", "name": "Sri Lanka"},
    {"code": "SD", "name": "Sudan"},
    {"code": "SY", "name": "Suriye"},
    {"code": "SA", "name": "S. Arabistan"},
    {"code": "TJ", "name": "Tacikistan"},
    {"code": "TZ", "name": "Tanzanya"},
    {"code": "TH", "name": "Tayland"},
    {"code": "TW", "name": "Tayvan"},
    {"code": "TG", "name": "Togo"},
    {"code": "TN", "name": "Tunus"},
    {"code": "TM", "name": "Türkmenistan"},
    {"code": "UG", "name": "Uganda"},
    {"code": "UA", "name": "Ukrayna"},
    {"code": "VE", "name": "Venezuela"},
    {"code": "VN", "name": "Vietnam"},
    {"code": "YE", "name": "Yemen"},
    {"code": "GR", "name": "Yunanistan"},
    {"code": "ZM", "name": "Zambiya"},
    {"code": "ZW", "name": "Zimbabve"}
]

# KKTC (CY) ve Tayvan (TW) gibi bazı özel bölgeler için Nager.Date API yanıt vermeyebilir,
# bu durumlar için statik veya fallback veriler üretilebilir.

OUT_DIR = "holidays"
os.makedirs(OUT_DIR, exist_ok=True)

def fetch_holidays(cc):
    url = f"https://date.nager.at/api/v3/PublicHolidays/2026/{cc}"
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except Exception as e:
        print(f"Error fetching {cc}: {e}")
        return None

def main():
    print(f"Starting to fetch holidays for {len(COUNTRIES)} countries...")
    for idx, c in enumerate(COUNTRIES):
        cc = c["code"]
        name = c["name"]
        print(f"[{idx+1}/{len(COUNTRIES)}] Fetching {name} ({cc})...")
        
        raw_data = fetch_holidays(cc)
        if raw_data:
            formatted = []
            for item in raw_data:
                cadence = item.get("localName", "")
                eng_name = item.get("name", "")
                if eng_name and eng_name != cadence:
                    cadence += f" ({eng_name})"
                
                formatted.append({
                    "title": item.get("localName") or item.get("name"),
                    "date": item.get("date"),
                    "cadence": cadence
                })
            
            out_path = os.path.join(OUT_DIR, f"{cc}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(formatted, f, ensure_ascii=False, indent=2)
            print(f"Saved {out_path} with {len(formatted)} holidays.")
        else:
            # Fallback empty list if fetch failed
            out_path = os.path.join(OUT_DIR, f"{cc}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print(f"Created fallback empty JSON for {cc}.")
            
        time.sleep(0.5)  # Respect API rate limits

    print("Finished fetching all holidays.")

if __name__ == "__main__":
    main()
