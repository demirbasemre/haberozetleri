# CODEMAP — haberozetleri/index.html

Tek dosya (~6440 satır). Haber arşivi + dashboard + yapılacaklar listesi.  
Veri: `data.json` (fetch ile yüklenir, n8n pushlar).

---

## Genel Yapı

```
<head>          CSS + Google Fonts + Chart.js CDN
<body>
  #main-content
    tab-news-btn / tab-dash-btn / tab-todo-btn   ← switchTab()
    #news-panel          haber kartları
    #dashboard-panel     gösterge paneli
    #todo-panel          yapılacaklar (gizli, display:none)
  #forecast-popover      IMF yıllık dizi popup
  #ai-fab + #ai-panel    AI chat butonu ve paneli
  #news-editor-panel     gizli haber düzenleme modu
<script>         tüm JS burada (inline)
```

---

## Sekmeler

| ID | İçerik |
|----|--------|
| `#news-panel` | Haber kartları, filtreler |
| `#dashboard-panel` | KPI kartları + grafikler |
| `#todo-panel` | Yapılacaklar listesi (gizli) |

`switchTab(tab)` → `tab` = `'news'` / `'dashboard'` / `'todo'`

---

## n8n Webhook'ları

| Sabit | URL | Amaç |
|-------|-----|------|
| `DATA_URL` | `data.json` | Haber verisi (GitHub Pages'den) |
| `_fetchN8nImf()` | `/webhook/imf-data` | IMF WEO GDP+CPI tüm ülkeler |
| `fredFetch()` | `/webhook/fred-proxy` | FRED petrol/enerji verisi |
| `AI_WEBHOOK` | `/webhook/haber-ai-v2` | AI soru-cevap |
| `FEEDBACK_WEBHOOK` | `/webhook/haber-ai-feedback` | AI feedback |
| `EDIT_WEBHOOK` | `/webhook/news-card-edit` | Haber kartı düzenleme |
| `GH_WEBHOOK` | `/webhook/todos` | Todo GET/POST |
| `etki-alani-feedback` | `/webhook/etki-alani-feedback` | Etki alanı formu |

---

## Dashboard Bölümleri (`#dashboard-panel`)

| Section ID | İçerik | Veri Kaynağı |
|------------|--------|-------------|
| `#dash-sec-anlık` | KPI kartları (IMF büyüme, FX, petrol) | n8n IMF + FRED |
| `#dash-sec-enerji` | Petrol çizgi grafiği | FRED via n8n |
| `#dash-sec-ekonomi` | GDP + CPI bar chart'ları | n8n IMF WEO |
| `#dash-sec-endeks` | Hava kargo endeksleri | (statik/placeholder) |
| `#dash-sec-takvim` | Yayın takvimi | Statik |

---

## KPI Kartları

| Card ID | İçerik | Özellik |
|---------|--------|---------|
| `#dc-imf` | Türkiye GSYH büyümesi | Tıklanınca popover, "Çizgi grafik" butonu ile karta grafik çizer |
| `#dc-gdp` | Küresel GDP | `updateImfChart` ile dolar |
| `#dc-fx` | USD/TRY | `fxFetch()` |
| `#dc-oil` | WTI petrol | `fredFetch('DCOILWTICO')` |
| `#dc-brent` | Brent petrol | `fredFetch('DCOILBRENTEU')` |

---

## IMF Grafik Sistemi

### Veri akışı
```
_fetchN8nImf()          → n8n /webhook/imf-data → { NGDP_RPCH: {TUR:{2015:x,...},...}, PCPIPCH: {...} }
imfSeriesFetch(ind, cc) → _fetchN8nImf() cache'den filtreler, WB→IMF kod maplar (WLD→WEOWORLD, EMU→EURO)
updateImfChart(...)     → imfSeriesFetch → barChart → _imfCache'e yazar
```

### Yıl sınıflandırması (2026 itibarıyla)
- `< currentYear` (≤2025) → **Gerçekleşen** (mavi)
- `=== currentYear` (2026) → **Tahmini** (sarı)
- `> currentYear` (≥2027) → **Öngörü** (mor)

### İlgili fonksiyonlar
- `updateImfChart(indicator, selId, chartId, metaId, kind)` — bar chart çizer, `_imfCache` doldurur
- `openForecastPopover(chartId, countryCode)` — yıllık dizi popup, "Çizgi grafik" butonu içerir
- `activateImfCardChart(countryCode, series, countryName, kind)` — `#dc-imf` kartını çizgi grafiğe çevirir (double rAF ile canvas fix)
- `_imfCache[chartId]` — `{ series, countries, kind, indicator }` — popover için cache

### Ülke grupları (`WB_GROUPS`)
`default` | `g7` | `brics` | `europe` | `middle_east` | `asia`

---

## Haber Sistemi

### Veri yükleme
```
fetch('data.json') → allArticles[] → render()
```
`data.json` n8n tarafından commit'lenir. Artış hızı ~120 haber/ay, ~1.5KB/haber.

### Temel fonksiyonlar
- `buildCardHTML(article)` — tek kart HTML'i
- `renderCards(articles)` — DOM'a yazar (Tarihsiz/tarihi hatalı haberleri en üste sabitlemek için pagination öncesi listeyi sıralar ve "Tarihsiz" grubunu en üstte konumlandırır).
- `getFilteredArticles()` — aktif filtreleri uygular
- `render()` — `getFilteredArticles()` → `renderCards()` + `updateStats()`
- `extractDateParts(dateStr)` — Tarih metinlerini normalize eder, "Published:" ön eklerini ve gün adlarını ayıklar, `{ y, m, day }` döner.
- `isoDateOf(a)` — Makalenin `date` veya `publishDate` değerini `YYYY-MM-DD` formatına çevirir.

### Filtreler (state global değişkenlerde)
- Tarih: `activeMonths`, `activeDays` — `buildDatePanel()` ile inşa edilir
- Havayolu: `activeAirlines` — `buildAirlineFilter()`
- Kaynak: `activeSources` — `buildSourceDropdown()`
- Bölge: `activeRegions`, `activeTKs` — `buildRegionDropdown()`
- Arama: `searchQuery`

### Haber kartı bileşenleri
- `etkiAlani` alanı → `parseEtkiAlani()` → renkli badge
- `toggleExtraSources(btn)` — çoklu kaynak aç/kapat
- `openAnalysisDrawer(btn)` / `closeAnalysisDrawer()` — analiz çekmecesi
- `openEtkiPopup(btn)` — etki alanı düzenleme formu

---

## IMF KPI Kartı — `#dc-imf` Detayı

```
Normal mod:       #dc-imf-normal  (dash-card-value, change, sub, note)
Grafik modu:      #dc-imf-chart-mode  (dcimf-hd, dcimf-canvas-wrap > canvas#dc-imf-canvas, dcimf-leg)
Geçiş:            card.classList.add('is-chart-mode')
Geri:             #dc-imf-back butonu → classList.remove('is-chart-mode')
Chart instance:   _dcImfLineChart (destroy edilip yeniden oluşturulur)
```

---

## Forecast Popover (`#forecast-popover`)

- Her ülke çubuğuna tıklanınca açılır (GDP veya CPI)
- **Footer'da sağda** "Çizgi grafik" butonu (`#fpop-chart-trigger`) → `activateImfCardChart()`
- Yıl badge'leri: `fpop-tag actual` / `fpop-tag estimate` / `fpop-tag forecast`
- Kapatma: × butonu, dışına tık, Escape

---

## Tema Sistemi

- `initTheme()` / `toggleTheme()` — `data-theme="dark"` attribute
- CSS değişkenler: `--bg`, `--card`, `--text`, `--text-2`, `--text-3`, `--border`, `--hover`, `--primary`

---

## AI Chat (`#ai-panel`)

- `askAI()` → `AI_WEBHOOK` (n8n) → haber arşivinden context seçer
- `selectArticles(question)` → `scoreArticle()` ile skor
- `addMsg()` / `addBotHTML()` — mesaj DOM'u
- `sendFeedback()` → `FEEDBACK_WEBHOOK`

---

## Todo Listesi (`#todo-panel`)

- State: `data = { todo: [], check: [] }` — `STORE_KEY` localStorage cache
- Sync: `loadDataFromGitHub()` / `saveData()` → `GH_WEBHOOK` (n8n)
- `renderList(type)` — `todo` veya `check` listesini çizer
- Etiketler: `parseTags(raw)` — `#tag` sözdizimi

---

## Gizli Haber Düzenleme (`#news-editor-panel`)

- `Ctrl+Shift+E` ile açılır
- `pushToGitHub(payload)` → `EDIT_WEBHOOK` (n8n)
- `loadEdits()` / `saveEdits()` — localStorage'da saklar
- `window.__applyNewsEdits(articles)` — data.json yüklenirken editler uygulanır

---

## CSS Önemli Sınıflar

| Sınıf | Açıklama |
|-------|----------|
| `.dash-card` | KPI kart base |
| `.dash-card-clickable` | cursor:pointer, tıklanabilir |
| `.dash-card.is-chart-mode` | #dc-imf grafik modu |
| `.chart-legend .cl-item` | Bar chart renk açıklaması |
| `.cl-dot-forecast` | Hatch pattern (tahmin/öngörü) |
| `.fpop-*` | Forecast popover bileşenleri |
| `.dcimf-*` | dc-imf kart grafik modu bileşenleri |
| `.dash-section-note` | Grafik altı bilgi notu |

---

## Chart.js Yapılandırması

- `CHART_DEFAULTS` — global defaults (responsive, tooltip stili)
- `lineChart(id, labels, datasets, yFmt, extraOpts)` — çizgi grafik helper
- `barChart(id, labels, data, colors, opts)` — yatay bar (`indexAxis:'y'`, `interaction: nearest/y`)
- `chartErr(id, html)` — hata durumu gösterimi

---

*Son güncelleme: 2026-05-21*
