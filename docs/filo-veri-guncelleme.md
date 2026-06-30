# Filo (Mevcut Filo) Veri Güncelleme Rehberi

Bu doküman, `data/fleet.json` içindeki uçak filosu verisinin **planespotters.net**'ten
nasıl yeniden çekileceğini ve hangi noktalara dikkat edilmesi gerektiğini anlatır.
Kullanıcı "filo verisini güncelle" dediğinde bu adımları takip et.

**Otomatikleştirilmemiştir, kasıtlı olarak manuel.** planespotters.net Cloudflare WAF +
kendi Turnstile doğrulamasıyla korunuyor; bu yüzden veri **yalnızca Claude in Chrome
eklentisiyle (kullanıcının gerçek, giriş yapılmış tarayıcı oturumuyla)** çekilmeli.
Headless/otomasyon araçlarıyla (Browserless, FlareSolverr vb.) bypass denenmemeli —
bu site özellikle bot trafiğini engellemek için iki katmanlı koruma kurmuş durumda.

## 0. Ön koşul

Kullanıcı Chrome'da planespotters.net'e zaten giriş yapmış olmalı (sağ üstte profil
ikonu görünür). Değilse önce kullanıcıdan giriş yapmasını iste, sonra devam et.

## 1. Havayolu → planespotters URL eşlemesi

| Kod | Ad | planespotters slug |
|---|---|---|
| TK | Turkish Airlines | `/airline/Turkish-Airlines` |
| EK | Emirates | `/airline/Emirates` |
| CX | Cathay Pacific | `/airline/Cathay-Pacific` |
| CK | China Cargo Airlines | `/airline/China-Cargo-Airlines` |
| QR | Qatar Airways | `/airline/Qatar-Airways` |
| LH | Lufthansa | `/airline/Lufthansa` |
| AFKLM | Air France-KLM | `/airline/Air-France` **+** `/airline/KLM-Royal-Dutch-Airlines` (ikisi birleştirilir) |
| KE | Korean Air | `/airline/Korean-Air` (otomatik `Korean-Air-Lines`'a yönlenir) |
| CV | Cargolux | `/airline/Cargolux-Airlines-International` (`/airline/Cargolux` 404 verir) |
| LA | LATAM Airlines | `/airline/LATAM-Airlines-Group` |
| CI | China Airlines | `/airline/China-Airlines` |
| CZ | China Southern | `/airline/China-Southern-Airlines` |
| CA | Air China | `/airline/Air-China` |
| SQ | Singapore Airlines | `/airline/Singapore-Airlines` |

## 2. Fleet Matrix verisini çekme (JS extraction)

Tıklama/expand işlemine gerek yok — alt tip (subtype) satırları DOM'da zaten mevcut,
sadece CSS ile gizli. Her havayolu sayfasında şu JS'i çalıştır
(`mcp__Claude_in_Chrome__javascript_tool`):

```js
let matrixTable = null;
document.querySelectorAll('table').forEach(t=>{ if(t.innerText.includes('Aircraft Type') && t.innerText.includes('In Service')) matrixTable = t; });
const rows = matrixTable.querySelectorAll('tbody tr');
let result = [];
let currentType = null;
rows.forEach(tr=>{
  const isSub = tr.classList.contains('subtype');
  const th = tr.querySelector('th');
  const label = th ? th.textContent.trim() : '';
  const tds = Array.from(tr.querySelectorAll('td')).map(td=>td.textContent.trim());
  if(!isSub){ currentType = label; }
  if(isSub && (tds[0]||tds[1]||tds[2]) && !label.includes('Bombardier') && !label.includes('Gulfstream')){
    result.push([label, tds[0],tds[1],tds[2],tds[3],tds[4],tds[5],tds[6]]);
  }
});
JSON.stringify(result);
```

Çıktı formatı: `[Tip, Aktif, Park, Toplam(current), Future, Historic, Ort.Yaş, Genel Toplam]`.
Sadece **mevcut filoda (in service/parked/total dolu)** olan satırlar alınır — tamamen
tarihi (historic-only) tipler atlanır.

## 3. Etiket dönüşümü (classifyVariant uyumluluğu)

`index.html`/`index_test.html` içindeki `classifyVariant(v)` fonksiyonu, tip adını
**kısaltılmış** formatta bekler ("Boeing" değil "B", "Airbus" prefiksi yok):

- `"Boeing 777F"` → `"B777F"`
- `"Boeing 787-9 Dreamliner"` → `"B787-9"`
- `"Boeing 737 MAX 8"` → `"B737-8"`, `"Boeing 737 MAX 9"` → `"B737-9"`
- `"Airbus A350-900"` → `"A350-900"`
- `"Airbus A321neo"` → `"A321NEO"`
- `"COMAC ARJ21-700 / C909-700"` → `"ARJ21-700"`, `"COMAC C919-100"` → `"C919-100"`

`age` alanı: `"15.1 Years"` → `"15.1"` (sadece sayı).

## 4. ⚠️ KRİTİK: Gizli kargo filolarını kontrol et

**Bu, bu rehberin en önemli adımı.** Büyük havayollarının çoğunda kargo (freighter)
filosu, ana sayfanın Fleet Matrix'inde **"F" etiketi olmadan**, yolcu uçaklarıyla aynı
satırda saklı olabilir (ör. "A330-200" hem yolcu hem kargo uçaklarını içerebilir).
`classifyVariant()` bir tipi yalnızca adında `-F`, `(F)`, veya bilinen regex
kalıplarından biri varsa "kargo" sayar — yoksa yanlışlıkla Geniş/Dar Gövde'ye
eklenir.

**Yöntem — her havayolu için:**

1. Havayolunun bilinen bir kargo markası/sayfası var mı kontrol et (aşağıdaki listeye
   bak, ama yeni eklenmiş olabilir, `/airline/<Ad>-Cargo` kalıbını dene).
2. Sayfa varsa (404 değilse) aynı JS extraction'ı orada da çalıştır.
3. **Subset mi (zaten ana sayfada sayılı) yoksa additive mi (ana sayfada hiç yok) belirle:**
   - Kargo sayfasındaki bir kayıt numarasını (`REG`, ör. `TC-JDO`) al.
   - `https://www.planespotters.net/search?q=<REG>` adresine git.
   - "PRODUCTION LIST DATA" tablosunda bu REG hem kargo markası hem ana havayolu
     altında **iki ayrı satırda** mı listeleniyor?
     - **Evet → SUBSET.** Bu uçaklar ana sayfadaki ilgili tipin (ör. "A330-200")
       içinde zaten sayılı. Ana sayfadaki ilgili `types[]` kaydını **böl**: kargo
       sayısını yeni bir `"<TİP>(F)"` kaydına ayır, kalanı yolcu kaydında bırak.
       Toplam (`ct`) **değişmemeli**.
     - **Hayır (sadece kargo markası altında) → ADDITIVE.** Bu uçaklar ana sayfada
       hiç sayılmamış. Yeni bir `"<TİP>(F)"` kaydı olarak **ekle**. Toplam (`ct`)
       artar.

**Bu oturumda doğrulanmış örnekler (referans, her seferinde yeniden kontrol et —
filo değişebilir):**

| Havayolu | Kargo sayfası | Sonuç |
|---|---|---|
| TK | `/airline/Turkish-Cargo` | SUBSET — A330-200'ün 10'u kargo (B777F zaten ayrı satırdaydı) |
| CX | `/airline/Cathay-Cargo` | SUBSET — B747-400 ve B747-8'in tamamı kargo |
| SQ | `/airline/Singapore-Airlines-Cargo` | SUBSET — B747-400'ün tamamı kargo |
| LH | `/airline/Lufthansa-Cargo` | ADDITIVE — 12× B777F ana sayfada hiç yoktu |
| CA | `/airline/Air-China-Cargo` | ADDITIVE — A330-200F(8) + B747-400F(2) + B777F(13) ana sayfada yoktu |
| LA | `/airline/LATAM-Cargo-Chile` + `/airline/LATAM-Cargo-Brasil` | ADDITIVE — B767-300F (toplam ~8) ana grupta yoktu |
| EK | `/airline/Emirates-SkyCargo` | Zaten ana sayfada doğru (B777F ayrı satır) — değişiklik yok |
| QR | `/airline/Qatar-Airways-Cargo` | Zaten ana sayfada doğru — değişiklik yok |
| KE, CZ, CI | `/airline/<Ad>-Cargo` | 404 — ayrı sayfa yok, ana sayfadaki veri zaten tam |
| CK, CV | — | Tüm filo zaten kargo (ayrı kontrol gerekmez) |
| AFKLM | AF ve KL ana sayfaları zaten B777F'i ayrı satırda gösteriyor | değişiklik yok |

Yeni bir havayolu eklenirse veya yıllar geçip filo değiştiyse bu tabloyu güncelle.

## 5. `data/fleet.json`'ı güncelle

Her havayolu objesi şu alanları içerir:
```json
{ "name": "...", "color": "#...", "ca": <aktif toplam>, "ci": <park toplam>,
  "cw": 0, "ct": <toplam>, "co": <future toplam>,
  "types": [ { "v": "...", "a": "...", "i": "...", "w": "", "t": "...", "o": "...", "age": "..." } ],
  "pt": <ct ile aynı>, "po": <co ile aynı>, "k1age": <ağırlıklı ortalama yaş> }
```
`ca/ci/ct/co` = `types[]` içindeki ilgili alanların toplamı (Python ile otomatik
hesaplanabilir, elle toplama).

`color` alanını **değiştirme** — mevcut tema renkleri korunmalı.

## 6. Sayfalardaki "Güncelleme Tarihi" metnini güncelle

`index.html` ve `index_test.html` içinde şu 3 yeri güncel tarihle değiştir
(`grep -n "Güncelleme Tarihi" *.html` ile bul):
- `#fleet-src-date` span'inin statik HTML değeri
- `switchFleetSrc()` içindeki `dt.textContent = 'Mevcut Filo (Güncelleme Tarihi: ...)'`
- `.fleet-update-note` içindeki "Planespotters.net kaynağından alınmıştır (...)" cümlesi

## 7. Test et

`mcp__Claude_Preview__preview_start` ile sunucuyu başlat, Filo → Mevcut Filo →
hem Kart hem Tablo görünümünü kontrol et:
- Toplam Filo sayıları mantıklı mı (önceki değerle çok büyük fark varsa sebebini
  araştır — yeni teslimat mı, veri hatası mı?)
- Kargo/Geniş Gövde/Dar Gövde dağılımı `classifyVariant()` ile doğru ayrışmış mı
  (özellikle yeni "(F)" etiketli kayıtlar)
- Tablo görünümünde kategori sütunlarını aç/kapat, dip toplamın doğru güncellendiğini
  doğrula

## 8. Git

**Asla otomatik commit/push yapma.** Değişiklikleri özetle, kullanıcının onayını
bekle, onay gelince commit + `main`'e push et, sonra ana repo dizininde
(`/Users/emre/Desktop/haberozetleri`) `git pull` çalıştır.
