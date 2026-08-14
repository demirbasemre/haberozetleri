# AI Agent Rehberi ve Proje Kuralları (Antigravity & Claude)

## 1. Temel Kurallar
- Her zaman Türkçe yaz ve Türkçe cevap ver.

## 2. Planespotters Filo Taraması (Fleet API & Camoufox Architecture)
- **Sunucu & Konteyner**: Sunucu evdeki Unraid makinesidir (`192.168.3.100`, SSH Port 26). `fleet-api` Docker konteynerı içerisinde çalışır (`/mnt/user/appdata/fleet-api/cf-proxy/fetch-proxy`).
- **Camoufox Anti-Detect Browser**: Tarama işlemi headless Chromium veya FlareSolverr yerine `Camoufox` (Firefox anti-detect) + `xvfb-run` sanal ekran altında çalışır.
- **Otomatik Oturum Açma (Sıfır Çerez Friction)**: `https://www.planespotters.net/user/login` adresine giderek `PLANESPOTTERS_USERNAME` (`demirbasemre@gmail.com`) ve `PLANESPOTTERS_PASSWORD` (`emre4emre`) bilgileriyle otomatik giriş yapar. Cloudflare Turnstile engelini otomatik aşar. Elle çerez yapıştırmaya gerek yoktur.
- **Cloudflare Worker KV Şifresi**: `FLEET_UPDATE_PASSWORD` varsayılan değeri `40159914086ac31549be` olarak ayarlanmıştır.

## 3. Planespotters Güncelleme Tarihi Mantığı (KRİTİK TARİH AYRIMI)
1. **Ana Başlık & Dropdown Butonu Tarihi (`Son Güncelleme Zamanı`)**:
   - Sistemimizde **tam ve başarılı bir taramanın en son çalıştırıldığı tarih** (ör. `27 Tem 2026`) gösterilmelidir (`_last_scan_date`).

2. **Tablo İçi Havayolu Bazlı Tarihler (`planespotters_last_updated`)**:
   - Tabloda her havayolunun yanındaki tarih **kesinlikle** Planespotters.net sitesindeki ilgili havayolu sayfasında yazan orijinal **"Last updated on Month DD, YYYY"** değeridir (ör. `24 Tem 2026`).
   - Bu tarih Planespotters üzerinde değişmediyse, o havayolu için yeniden tarama yapılmayıp hızlıca geçilir (skip/fast-pass).

## 4. Ön Yüz İlerleme ve Bağlantı Mantığı (`index.html` & `index_test.html`)
- **HTTP 409 (Tarama Zaten Sürüyor)**:
  - Kullanıcı "Uçak Listesini Güncelle" butonuna bastığında arka planda zaten yürütülen bir tarama varsa API `409` döner.
  - Arayüz hata penceresi açmak yerine modalı açık tutar ve `/api/aircraft-status` endpoint'ini periyodik sorgulayarak (poll) yürütülmekte olan canlı taramaya bağlanır ve ilerlemeyi gösterir.

## 5. Finansal Veri Standardı ve Resmi Kaynak Zorunluluğu
- **Resmi Şirket Finansal Raporları Zorunluluğu**: Finansal tablolardaki tüm metrikler, gelirler, kâr marjları ve rasyolar **HER ZAMAN VE KESİNLİKLE** şirketlerin resmi bağımsız denetimden geçmiş mali raporlarından (IFRS / US GAAP 10-K, 10-Q, BIST KAP / SEC / Euronext / HKEX / TWSE borsa bildirimleri ve resmi Yatırımcı İlişkileri raporları) alınmalıdır. Üçüncü taraf gayriresmi varsayım verileri kullanılamaz.
