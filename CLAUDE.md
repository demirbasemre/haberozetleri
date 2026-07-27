# Proje Hafızası ve Kurallar (Claude & Antigravity)

Bu proje için genel agent kuralları ve Planespotters mimari detayları `.agents/AGENTS.md` dosyasında tanımlanmıştır.

## Özet Kurallar
1. **Dil**: Her zaman Türkçe cevap ver.
2. **Planespotters Mimarisi**:
   - Unraid sunucusunda (`192.168.3.100:26`) `fleet-api` Docker konteyneri içinde çalışır.
   - `Camoufox` anti-detect tarayıcı ve `xvfb-run` sanal ekran kullanır.
   - `https://www.planespotters.net/user/login` sayfasından kullanıcı adı (`demirbasemre@gmail.com`) ve şifre (`emre4emre`) ile otomatik giriş yapar. Manuel çerez gerekmez.
   - Worker KV update şifresi: `40159914086ac31549be`.
3. **Planespotters Güncelleme Tarihi kuralı**:
   - `planespotters_last_updated` alanına **asla bugünün tarihi yazılmaz**.
   - Sadece Planespotters.net sayfasında yazan orijinal **"Last updated on Month DD, YYYY"** tarihi okunup kaydedilir.
4. **Arayüz (index.html / index_test.html)**:
   - Tıklamada arka planda süren tarama varsa (HTTP 409), hata vermek yerine modal açık kalarak canlı `/api/aircraft-status` takibine bağlanır.
