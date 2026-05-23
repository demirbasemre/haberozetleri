/* ═══════════════════════════════════════════════════════════════════
   Haber Okuyucu Modal — masaüstünde haber sitesini in-page açar
   Readability.js + çoklu proxy fallback + adımlı animasyonlu yükleme
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const READABILITY_CDN = 'https://cdn.jsdelivr.net/npm/@mozilla/readability@0.5.0/Readability.js';
  const DESKTOP_BREAKPOINT = 769;

  // Proxy zinciri — sırayla denenir; ilk başarılı olan kullanılır
  const PROXIES = [
    {
      name: 'cf-worker',
      url: u => 'https://haberozetleri-proxy.demirbasemre.workers.dev/?url=' + encodeURIComponent(u),
      parse: async r => r.text()
    },
    {
      name: 'allorigins',
      url: u => 'https://api.allorigins.win/get?url=' + encodeURIComponent(u),
      parse: async r => { const d = await r.json(); if (!d.contents) throw new Error('Boş yanıt'); return d.contents; }
    },
    {
      name: 'corsproxy.io',
      url: u => 'https://corsproxy.io/?' + encodeURIComponent(u),
      parse: async r => r.text()
    },
    {
      name: 'thingproxy',
      url: u => 'https://thingproxy.freeboard.io/fetch/' + u,
      parse: async r => r.text()
    }
  ];

  const cache = new Map();
  const translationCache = new Map();
  let modal = null;
  let readabilityLoaded = null;
  let stylesInjected = false;
  let currentArticle = null;
  let currentSourceUrl = null;
  let isSyncScrolling = false;
  let activeScrollSource = null;

  // ── CSS — bir kez DOM'a eklenir ──────────────────────────────────
  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const el = document.createElement('style');
    el.textContent = `
/* ── Reader Steps Loading ──────────────────── */
.reader-steps-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 52px 32px 48px;
  min-height: 320px;
}
.reader-steps-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 32px;
  letter-spacing: -0.01em;
}
.reader-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  max-width: 300px;
}
.reader-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
}
/* Connecting line between steps */
.reader-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 15px;
  top: 32px;
  width: 2px;
  height: 28px;
  background: var(--border);
  border-radius: 1px;
  transition: background 0.3s ease;
}
.reader-step.rs-done:not(:last-child)::after {
  background: #10b981;
}
.reader-step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
  position: relative;
  z-index: 1;
}
.reader-step-text {
  padding-top: 6px;
  padding-bottom: 28px;
}
.reader-step-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-3);
  transition: color 0.25s ease;
  line-height: 1.4;
}
.reader-step-sub {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 2px;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  line-height: 1.5;
}

/* Active step */
.reader-step.rs-active .reader-step-icon {
  border-color: var(--accent, #1D6FE8);
  background: rgba(29,111,232,0.08);
  box-shadow: 0 0 0 4px rgba(29,111,232,0.12);
  animation: rsPulse 1.6s ease-in-out infinite;
}
.reader-step.rs-active .reader-step-label {
  color: var(--text);
  font-weight: 600;
}
.reader-step.rs-active .reader-step-sub {
  opacity: 1;
  transform: translateY(0);
}

/* Done step */
.reader-step.rs-done .reader-step-icon {
  border-color: #10b981;
  background: rgba(16,185,129,0.1);
  box-shadow: none;
  animation: none;
}
.reader-step.rs-done .reader-step-label {
  color: var(--text-2);
  font-weight: 500;
}

@keyframes rsPulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(29,111,232,0.12); }
  50%       { box-shadow: 0 0 0 8px rgba(29,111,232,0.06); }
}
@media (prefers-reduced-motion: reduce) {
  .reader-step.rs-active .reader-step-icon { animation: none; }
}

/* Step SVGs */
.rs-icon-pending { color: var(--border); }
.rs-icon-active  { color: var(--accent, #1D6FE8); }
.rs-icon-done    { color: #10b981; }

/* ── Error state ────────────────────────────── */
.reader-error-v2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 52px 32px 48px;
  text-align: center;
  animation: rsSlideUp 0.22s ease-out;
}
@keyframes rsSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reader-error-v2-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(239,68,68,0.08);
  border: 1.5px solid rgba(239,68,68,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  margin-bottom: 4px;
}
.reader-error-v2-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}
.reader-error-v2-msg {
  font-size: 13px;
  color: var(--text-2);
  max-width: 340px;
  line-height: 1.6;
}
.reader-error-v2-hint {
  font-size: 12px;
  color: var(--text-3);
  max-width: 320px;
  line-height: 1.5;
  background: var(--bg);
  border-radius: 8px;
  padding: 10px 14px;
  border: 1px solid var(--border-soft);
}
.reader-error-v2-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}
.reader-error-v2-retry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.15s ease;
}
.reader-error-v2-retry:hover {
  border-color: var(--accent, #1D6FE8);
  color: var(--accent, #1D6FE8);
  background: rgba(29,111,232,0.05);
}
.reader-error-v2-open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 20px;
  border: 1.5px solid transparent;
  background: var(--accent, #1D6FE8);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s ease;
}
.reader-error-v2-open:hover { opacity: 0.88; }

/* ── Reader Translate Panel ────────────────── */
.reader-body-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}
.reader-translate-panel {
  display: none;
  width: 50%;
  border-left: 1px solid var(--border);
  overflow-y: auto;
  background: var(--surface-2, #fafafa);
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.reader-translate-panel::-webkit-scrollbar { width: 5px; }
.reader-translate-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.reader-window {
  transition: width 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.reader-window.translate-open {
  width: min(1300px, calc(100vw - 48px)) !important;
}
.reader-window.translate-open .reader-translate-panel {
  display: block;
}
.reader-window.translate-open .reader-hero {
  display: none !important;
}

.reader-translate-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.13s;
}
.reader-translate-btn:hover { background: var(--bg); color: var(--text); }
.reader-translate-btn.active {
  background: rgba(29, 111, 232, 0.08);
  border-color: var(--accent, #1D6FE8);
  color: var(--accent, #1D6FE8);
}

.reader-sync-btn {
  display: none;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.13s;
  margin-right: 4px;
}
.reader-sync-btn:hover { background: var(--bg); color: var(--text); }
.reader-sync-btn.active {
  background: rgba(16, 185, 129, 0.08);
  border-color: #10b981;
  color: #10b981;
}
.reader-window.translate-open #reader-sync-scroll {
  display: inline-flex;
}

.reader-text-segment {
  transition: background-color 0.15s ease;
  border-radius: 2px;
}
#reader-body .reader-text-segment.highlight {
  background-color: rgba(29, 111, 232, 0.12) !important;
}
#reader-translate-panel .reader-text-segment.highlight {
  background-color: rgba(16, 185, 129, 0.12) !important;
}

@media (max-width: 768px) {
  .reader-window.translate-open {
    width: calc(100vw - 24px) !important;
  }
  .reader-body-wrapper.translate-active {
    flex-direction: column;
  }
  .reader-window.translate-open .reader-translate-panel {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--border);
    height: 50%;
  }
}
    `;
    document.head.appendChild(el);
  }

  // ── Load Readability.js once ─────────────────────────────────────
  function loadReadability() {
    if (readabilityLoaded) return readabilityLoaded;
    readabilityLoaded = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = READABILITY_CDN;
      s.onload = () => resolve(window.Readability);
      s.onerror = () => reject(new Error('Readability yüklenemedi'));
      document.head.appendChild(s);
    });
    return readabilityLoaded;
  }

  // ── Fetch HTML through proxy chain ───────────────────────────────
  async function fetchHtml(url, onProxy) {
    let lastErr;
    for (const proxy of PROXIES) {
      try {
        onProxy && onProxy(proxy.name);
        const resp = await fetch(proxy.url(url), { signal: AbortSignal.timeout(12000) });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const html = await proxy.parse(resp);
        if (!html || html.length < 200) throw new Error('Çok kısa yanıt');
        return html;
      } catch (e) {
        lastErr = e;
      }
    }
    throw new Error('Tüm kaynaklar başarısız oldu: ' + (lastErr?.message || ''));
  }

  // ── Fetch + extract with step callbacks ──────────────────────────
  const CACHE_BASE = 'https://raw.githubusercontent.com/demirbasemre/haberozetleri/main/news-cache';

  async function extractArticle(url, onStep, cacheKey) {
    if (cache.has(url)) { onStep && onStep('done'); return cache.get(url); }

    // Try GitHub static cache first (instant, no proxy needed)
    if (cacheKey && cacheKey.source && cacheKey.id) {
      try {
        const cacheUrl = `${CACHE_BASE}/${cacheKey.source}/${cacheKey.id}.json`;
        const res = await fetch(cacheUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const cached = await res.json();
          if (cached.content && cached.content.length > 100) {
            onStep && onStep('done');
            const out = {
              title: cached.title || '',
              content: '<p>' + cached.content
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>',
              excerpt: cached.content.slice(0, 200),
              byline: '',
              image: null,
              siteName: (() => { try { return new URL(url).hostname; } catch { return ''; } })()
            };
            cache.set(url, out);
            return out;
          }
        }
      } catch (_) { /* cache miss — fall through to proxy */ }
    }

    onStep && onStep('connect');
    const [Readability] = await Promise.all([loadReadability()]);

    onStep && onStep('fetch');
    const html = await fetchHtml(url, () => {});

    onStep && onStep('extract');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    if (!doc.head.querySelector('base')) {
      const base = doc.createElement('base');
      base.href = url;
      doc.head.prepend(base);
    }

    const ogImage = doc.querySelector('meta[property="og:image"]')?.content
                 || doc.querySelector('meta[name="twitter:image"]')?.content
                 || doc.querySelector('article img, main img, [class*="hero"] img')?.src
                 || null;
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || doc.title;

    onStep && onStep('clean');
    const docClone = doc.cloneNode(true);

    // ── Clean up duplicate featured images & non-content elements ──
    try {
      // 1. Remove by class names commonly used for featured images
      docClone.querySelectorAll('img.wp-post-image, img.post-featured-img, img.attachment-post-thumbnail, .featured-media img, .featured-image img, .post-thumbnail img').forEach(el => el.remove());
      
      // 2. Remove non-content elements that confuse Readability (author boxes, share buttons, newsletter forms, comments, etc.)
      docClone.querySelectorAll([
        '.elementor-widget-author-box', '.author-box', '.author-profile', '.about-author',
        '.elementor-widget-share-buttons', '.share-buttons', '.social-share', '.post-sharing', '.share-post',
        '.elementor-widget-form', '.subscribe-box', '.newsletter-signup', '.newsletter-section', '.subform_holder',
        '#comments', '.comments-area', '#respond',
        'aside', '.sidebar', '.widget-area'
      ].join(',')).forEach(el => el.remove());
      
      // 2. Remove first image if it matches the hero image filename
      if (ogImage) {
        const getBaseFilename = (urlStr) => {
          try {
            const pathname = new URL(urlStr, url).pathname;
            const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
            const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
            return nameWithoutExt.replace(/-(scaled|\d+x\d+)$/i, '');
          } catch (_) { return ''; }
        };
        const ogBase = getBaseFilename(ogImage);
        if (ogBase) {
          const firstImg = docClone.querySelector('img');
          if (firstImg) {
            const firstImgSrc = firstImg.src || firstImg.getAttribute('data-src') || firstImg.getAttribute('src') || '';
            if (firstImgSrc && getBaseFilename(firstImgSrc) === ogBase) {
              // Only remove if it's not inside a figure (to preserve captioned body images if they happen to be first)
              if (!firstImg.closest('figure')) {
                firstImg.remove();
              }
            }
          }
        }
      }
    } catch (_) {}

    const reader = new Readability(docClone, { charThreshold: 200 });
    const result = reader.parse();

    const out = {
      title: result?.title || ogTitle || 'Başlıksız',
      content: result?.content || '<p>İçerik çıkarılamadı.</p>',
      excerpt: result?.excerpt || '',
      byline: result?.byline || '',
      image: ogImage,
      siteName: result?.siteName || new URL(url).hostname
    };
    cache.set(url, out);
    return out;
  }

  // ── Step definitions ─────────────────────────────────────────────
  const STEPS = [
    {
      id: 'connect',
      label: 'Kaynağa bağlanılıyor',
      sub: 'Güvenli proxy üzerinden bağlantı kuruluyor…',
      icon: pending => pending
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    },
    {
      id: 'fetch',
      label: 'Sayfa indiriliyor',
      sub: 'HTML içeriği aktarılıyor…',
      icon: pending => pending
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v10M8 8l4 4 4-4"/><rect x="3" y="16" width="18" height="6" rx="1"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    },
    {
      id: 'extract',
      label: 'Metin ve görseller çıkarılıyor',
      sub: 'Readability ile ana içerik belirleniyor…',
      icon: pending => pending
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    },
    {
      id: 'clean',
      label: 'Reklam ve gereksiz kısımlar eleniyor',
      sub: 'Temiz okuma modu hazırlanıyor…',
      icon: pending => pending
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    },
  ];

  // ── Animated step loading UI ─────────────────────────────────────
  function setStepLoading(sourceLabel) {
    const body = modal.querySelector('#reader-body');
    body.innerHTML = `
      <div class="reader-steps-wrap" aria-live="polite" aria-label="Yükleniyor">
        <div class="reader-steps-title">${escapeHtml(sourceLabel || 'Kaynak')} okunuyor</div>
        <div class="reader-steps" id="rs-steps">
          ${STEPS.map((s, i) => `
            <div class="reader-step" id="rs-step-${s.id}" data-idx="${i}">
              <div class="reader-step-icon" id="rs-icon-${s.id}">
                <span class="rs-icon-pending">${s.icon(true)}</span>
              </div>
              <div class="reader-step-text">
                <div class="reader-step-label">${escapeHtml(s.label)}</div>
                <div class="reader-step-sub">${escapeHtml(s.sub)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function advanceStep(stepId) {
    const stepIdx = STEPS.findIndex(s => s.id === stepId);
    if (stepIdx < 0) return;
    STEPS.forEach((s, i) => {
      const el = modal?.querySelector(`#rs-step-${s.id}`);
      const iconEl = modal?.querySelector(`#rs-icon-${s.id}`);
      if (!el) return;
      el.classList.remove('rs-active', 'rs-done');
      if (i < stepIdx) {
        el.classList.add('rs-done');
        if (iconEl) iconEl.innerHTML = `<span class="rs-icon-done">${s.icon(false)}</span>`;
      } else if (i === stepIdx) {
        el.classList.add('rs-active');
        if (iconEl) iconEl.innerHTML = `<span class="rs-icon-active">${s.icon(true)}</span>`;
      }
    });
  }

  // ── Error state v2 ───────────────────────────────────────────────
  function setError(message, link, onRetry) {
    const body = modal.querySelector('#reader-body');
    body.innerHTML = `
      <div class="reader-error-v2" role="alert">
        <div class="reader-error-v2-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="reader-error-v2-title">Sayfa alınamadı</div>
        <div class="reader-error-v2-msg">Haber sitesi proxy üzerinden yüklenemedi. Site erişimi engelliyor olabilir.</div>
        <div class="reader-error-v2-hint">
          💡 Yeni sekmede açarak haberin tamamını okuyabilirsin.
        </div>
        <div class="reader-error-v2-actions">
          ${onRetry ? `<button class="reader-error-v2-retry" id="rs-retry">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Tekrar dene
          </button>` : ''}
          ${link ? `<a class="reader-error-v2-open" href="${link}" target="_blank" rel="noopener noreferrer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Yeni sekmede aç
          </a>` : ''}
        </div>
      </div>
    `;
    if (onRetry) {
      body.querySelector('#rs-retry')?.addEventListener('click', onRetry);
    }
  }

  function setContent(article, sourceUrl) {
    const body = modal.querySelector('#reader-body');
    body.innerHTML = `
      <article class="reader-article">
        ${article.image ? `<div class="reader-hero"><img src="${article.image}" loading="lazy" alt=""></div>` : ''}
        <h1 class="reader-title">${escapeHtml(article.title)}</h1>
        ${article.byline ? `<div class="reader-byline">${escapeHtml(article.byline)} · ${escapeHtml(article.siteName)}</div>` : `<div class="reader-byline">${escapeHtml(article.siteName)}</div>`}
        <div class="reader-content">${sanitize(article.content)}</div>
        <div class="reader-end-note"></div>
      </article>
    `;
    body.scrollTop = 0;
  }

  // ── Source tabs ──────────────────────────────────────────────────
  function renderSourceTabs(sources, activeIdx, onPick) {
    const wrap = modal.querySelector('#reader-source-tabs');

    wrap.innerHTML = `
      <div class="reader-source-label">Kaynak:</div>
      ${sources.map((s, i) => `
        <button class="reader-source-tab ${i === activeIdx ? 'on' : ''}" data-idx="${i}">
          <img class="reader-source-fav" src="${getFavicon(s.source)}" alt="" loading="lazy" onerror="this.style.display='none'">
          <span>${escapeHtml(getSourceLabel(s.source) || s.source || 'Kaynak ' + (i+1))}</span>
        </button>
      `).join('')}
    `;
    wrap.querySelectorAll('[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => onPick(parseInt(btn.dataset.idx, 10)));
    });
  }

  // ── Translation Utilities ────────────────────────────────────────
  async function translateText(text, targetLang = 'tr') {
    if (!text || !text.trim()) return '';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map(x => x ? x[0] : '').join('');
    }
    throw new Error('Geçersiz yanıt');
  }

  async function translateArticleContent(contentNode) {
    const sentenceRegex = /((?<!\b[a-zA-Z]\.)(?<!\b(?:Inc|Corp|Co|Ltd|Mr|Mrs|Ms|Dr|vs|eg|ie|ca|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec|vol|ed|pp|al|U\.S)\.)(?<=[.!?])\s+)/gi;

    // 1. Collect all text nodes with letters in the live contentNode
    const textNodes = [];
    function collectTextNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const txt = node.nodeValue.trim();
        // Only collect text nodes that have at least one letter
        if (txt.length > 0 && /[a-zA-Z]/.test(txt)) {
          textNodes.push(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'SPAN') {
          for (const child of Array.from(node.childNodes)) {
            collectTextNodes(child);
          }
        }
      }
    }
    collectTextNodes(contentNode);
    
    // 2. Split each text node into sentences, and wrap them in span.reader-text-segment with data-segment-id
    const segments = [];
    let segmentIdx = 0;
    
    textNodes.forEach(node => {
      const parent = node.parentNode;
      const textVal = node.nodeValue;
      
      const parts = textVal.split(sentenceRegex);
      
      parts.forEach(part => {
        if (part.trim().length > 0 && /[a-zA-Z]/.test(part)) {
          const span = document.createElement('span');
          span.className = 'reader-text-segment';
          span.dataset.segmentId = segmentIdx;
          span.textContent = part;
          
          parent.insertBefore(span, node);
          segments.push({ span, text: part.trim(), id: segmentIdx });
          segmentIdx++;
        } else if (part.length > 0) {
          parent.insertBefore(document.createTextNode(part), node);
        }
      });
      
      parent.removeChild(node);
    });
    
    const cloned = contentNode.cloneNode(true);
    if (segments.length === 0) return cloned.innerHTML;
    
    // 3. Batch translate the segments
    const batches = [];
    let currentBatch = [];
    let currentLen = 0;
    
    for (const item of segments) {
      if (currentLen + item.text.length > 1800 && currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [];
        currentLen = 0;
      }
      currentBatch.push(item);
      currentLen += item.text.length;
    }
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    for (const batch of batches) {
      const joinedText = batch.map(item => item.text).join('\n\n');
      try {
        const translatedJoined = await translateText(joinedText);
        const translatedTexts = translatedJoined.split(/\n\s*\n/);
        
        if (translatedTexts.length !== batch.length) {
          throw new Error('Split length mismatch: ' + translatedTexts.length + ' vs ' + batch.length);
        }
        
        batch.forEach((item, idx) => {
          const trans = translatedTexts[idx];
          if (trans) {
            const targetSpan = cloned.querySelector(`.reader-text-segment[data-segment-id="${item.id}"]`);
            if (targetSpan) {
              targetSpan.textContent = trans.trim();
            }
          }
        });
      } catch (err) {
        console.error('Batch translation failed or length mismatched, translating segments individually:', err);
        for (const item of batch) {
          try {
            const trans = await translateText(item.text);
            const targetSpan = cloned.querySelector(`.reader-text-segment[data-segment-id="${item.id}"]`);
            if (targetSpan) {
              targetSpan.textContent = trans.trim();
            }
          } catch (_) {}
        }
      }
    }
    
    return cloned.innerHTML;
  }

  async function toggleTranslation() {
    const win = modal.querySelector('#reader-window');
    const panel = modal.querySelector('#reader-translate-panel');
    const content = modal.querySelector('#reader-translate-content');
    const btn = modal.querySelector('#reader-translate');
    const wrapper = modal.querySelector('#reader-body-wrapper');
    
    if (!win || !panel || !content || !btn) return;
    
    const isOpen = win.classList.contains('translate-open');
    
    if (isOpen) {
      win.classList.remove('translate-open');
      btn.classList.remove('active');
      if (wrapper) wrapper.classList.remove('translate-active');
      
      // Reset scroll sync when closed
      isSyncScrolling = false;
      const syncBtn = modal.querySelector('#reader-sync-scroll');
      if (syncBtn) syncBtn.classList.remove('active');
      
      setTimeout(() => { panel.style.display = 'none'; }, 300);
    } else {
      panel.style.display = 'block';
      panel.offsetHeight; // Reflow
      win.classList.add('translate-open');
      btn.classList.add('active');
      if (wrapper) wrapper.classList.add('translate-active');
      
      // Auto-enable sync scroll when translation is opened
      isSyncScrolling = true;
      const syncBtn = modal.querySelector('#reader-sync-scroll');
      if (syncBtn) syncBtn.classList.add('active');
      
      const cacheKey = currentSourceUrl;
      if (translationCache.has(cacheKey)) {
        content.innerHTML = translationCache.get(cacheKey);
      } else {
        content.innerHTML = `
          <div class="reader-loading">
            <div class="reader-spinner"></div>
            <div class="reader-loading-text">
              <strong>Türkçe'ye çevriliyor...</strong>
              <span class="reader-loading-sub">Google Translate kullanılıyor.</span>
            </div>
          </div>
        `;
        
        try {
          const articleContentNode = modal.querySelector('#reader-body .reader-content');
          const articleTitleNode = modal.querySelector('#reader-body .reader-title');
          const articleBylineNode = modal.querySelector('#reader-body .reader-byline');
          
          if (!articleContentNode) {
            content.innerHTML = '<div class="reader-error"><div class="reader-error-title">Hata</div><div class="reader-error-msg">Okunacak içerik bulunamadı.</div></div>';
            return;
          }
          
          const originalTitle = articleTitleNode ? articleTitleNode.textContent : (currentArticle ? currentArticle.title : '');
          const originalBylineText = articleBylineNode ? articleBylineNode.textContent : '';
          
          const [translatedTitle, translatedByline, translatedContentHtml] = await Promise.all([
            translateText(originalTitle),
            originalBylineText ? translateText(originalBylineText) : Promise.resolve(''),
            translateArticleContent(articleContentNode)
          ]);
          
          const html = `
            <article class="reader-article">
              <h1 class="reader-title">${escapeHtml(translatedTitle)}</h1>
              ${translatedByline ? `<div class="reader-byline">${escapeHtml(translatedByline)}</div>` : ''}
              <div class="reader-content">${translatedContentHtml}</div>
            </article>
          `;
          
          translationCache.set(cacheKey, html);
          content.innerHTML = html;
        } catch (err) {
          content.innerHTML = `
            <div class="reader-error-v2">
              <div class="reader-error-v2-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div class="reader-error-v2-title">Çeviri Başarısız</div>
              <div class="reader-error-v2-msg">Haber metni çevrilemedi. Lütfen daha sonra tekrar deneyin.</div>
              <div class="reader-error-v2-hint">${escapeHtml(err.message)}</div>
              <div class="reader-error-v2-actions">
                <button class="reader-error-v2-retry" id="rs-translate-retry">Tekrar dene</button>
              </div>
            </div>
          `;
          content.querySelector('#rs-translate-retry')?.addEventListener('click', () => {
            translationCache.delete(cacheKey);
            toggleTranslation();
            toggleTranslation();
          });
        }
      }
    }
  }

  // ── Build modal once ─────────────────────────────────────────────
  function buildModal() {
    if (modal) return modal;
    injectStyles();
    modal = document.createElement('div');
    modal.id = 'reader-modal';
    modal.innerHTML = `
      <div class="reader-backdrop" data-close="1"></div>
      <div class="reader-window" id="reader-window" role="dialog" aria-modal="true" aria-label="Haber okuyucu">
        <div class="reader-head">
          <div class="reader-head-meta">
            <div class="reader-source-tabs" id="reader-source-tabs"></div>
            <div class="reader-head-right">
              <button class="reader-translate-btn" id="reader-translate" title="Türkçe'ye Çevir">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
                  <path d="m5 8 6 6M4 14l6-6M2 2h10v10H2zM12 12h10v10H12z"/>
                </svg>
                Çevir
              </button>
              <button class="reader-sync-btn" id="reader-sync-scroll" title="Eş Zamanlı Kaydır">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
                  <path d="M17 3v18M7 3v18M3 7l4-4 4 4M13 17l4 4 4-4"/>
                </svg>
                Eş Zamanlı Kaydır
              </button>
              <a class="reader-external-btn" id="reader-external" target="_blank" rel="noopener noreferrer" title="Kaynağı yeni sekmede aç">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Yeni sekmede aç
              </a>
              <button class="reader-close" data-close="1" aria-label="Kapat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="reader-body-wrapper" id="reader-body-wrapper">
          <div class="reader-body" id="reader-body"></div>
          <div class="reader-translate-panel" id="reader-translate-panel">
            <div class="reader-translate-content" id="reader-translate-content"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#reader-translate')?.addEventListener('click', toggleTranslation);
    modal.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    const bodyEl = modal.querySelector('#reader-body');
    const panelEl = modal.querySelector('#reader-translate-panel');
    const syncBtn = modal.querySelector('#reader-sync-scroll');
    const bodyWrapper = modal.querySelector('#reader-body-wrapper');

    const handleScroll = (e) => {
      if (!isSyncScrolling) return;
      const target = e.currentTarget;
      if (activeScrollSource && activeScrollSource !== target) return;
      activeScrollSource = target;

      const other = target === bodyEl ? panelEl : bodyEl;
      
      const targetMax = target.scrollHeight - target.clientHeight;
      if (targetMax <= 0) return;
      const percentage = target.scrollTop / targetMax;
      
      const otherMax = other.scrollHeight - other.clientHeight;
      other.scrollTop = percentage * otherMax;

      clearTimeout(target.scrollTimeout);
      target.scrollTimeout = setTimeout(() => {
        activeScrollSource = null;
      }, 50);
    };

    bodyEl.addEventListener('scroll', handleScroll, { passive: true });
    panelEl.addEventListener('scroll', handleScroll, { passive: true });

    syncBtn?.addEventListener('click', () => {
      isSyncScrolling = !isSyncScrolling;
      syncBtn.classList.toggle('active', isSyncScrolling);
    });

    // Segment Hover Highlights
    bodyWrapper?.addEventListener('mouseover', e => {
      const segment = e.target.closest('.reader-text-segment');
      if (!segment) return;
      
      const id = segment.dataset.segmentId;
      if (id === undefined) return;
      
      bodyWrapper.querySelectorAll(`.reader-text-segment[data-segment-id="${id}"]`).forEach(el => {
        el.classList.add('highlight');
      });
    });
    
    bodyWrapper?.addEventListener('mouseout', e => {
      const segment = e.target.closest('.reader-text-segment');
      if (!segment) return;
      
      const id = segment.dataset.segmentId;
      if (id === undefined) return;
      
      bodyWrapper.querySelectorAll(`.reader-text-segment[data-segment-id="${id}"]`).forEach(el => {
        el.classList.remove('highlight');
      });
    });

    return modal;
  }

  function openModal() {
    if (!modal) buildModal();
    document.body.style.overflow = 'hidden';
    modal.classList.add('open');
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';

    // Reset translation panel states
    const win = modal.querySelector('#reader-window');
    const panel = modal.querySelector('#reader-translate-panel');
    const btn = modal.querySelector('#reader-translate');
    const wrapper = modal.querySelector('#reader-body-wrapper');
    if (win) win.classList.remove('translate-open');
    if (panel) panel.style.display = 'none';
    if (btn) btn.classList.remove('active');
    if (wrapper) wrapper.classList.remove('translate-active');

    // Reset scroll sync state
    isSyncScrolling = false;
    const syncBtn = modal.querySelector('#reader-sync-scroll');
    if (syncBtn) syncBtn.classList.remove('active');
  }

  // ── Public API: open(article) ─────────────────────────────────
  async function openReader(article) {
    currentArticle = article;
    const sources = (article._sources && article._sources.length > 0)
      ? article._sources
      : [{ source: article.source, link: article.link }];

    openModal();

    let activeIdx = 0;
    const loadSource = async (idx, isRetry) => {
      // Reset translation state for this source load
      const win = modal.querySelector('#reader-window');
      const panel = modal.querySelector('#reader-translate-panel');
      const btn = modal.querySelector('#reader-translate');
      const wrapper = modal.querySelector('#reader-body-wrapper');
      const content = modal.querySelector('#reader-translate-content');
      if (win) win.classList.remove('translate-open');
      if (panel) panel.style.display = 'none';
      if (btn) btn.classList.remove('active');
      if (wrapper) wrapper.classList.remove('translate-active');
      if (content) content.innerHTML = '';

      // Reset scroll sync state
      isSyncScrolling = false;
      const syncBtn = modal.querySelector('#reader-sync-scroll');
      if (syncBtn) syncBtn.classList.remove('active');

      activeIdx = idx;
      renderSourceTabs(sources, idx, loadSource);
      const src = sources[idx];
      if (!src || !src.link) { setError('Bu kaynağın linki yok.', null, null); return; }
      modal.querySelector('#reader-external').href = src.link;
      currentSourceUrl = src.link;

      setStepLoading(getSourceLabel(src.source) || src.source);
      // Küçük bir delay ile ilk adımı göster (animasyon görünsün)
      await delay(60);
      advanceStep('connect');

      try {
        const result = await extractArticle(src.link, step => {
          // delay ile adım geçişleri daha görünür olsun
          setTimeout(() => advanceStep(step), step === 'fetch' ? 100 : step === 'extract' ? 200 : step === 'clean' ? 300 : 0);
        }, { source: src.source || article.source, id: String(article.id || '') });
        // Temizleme adımını tamamlanmış göster
        await delay(350);
        setContent(result, src.link);
      } catch (e) {
        setError(e.message, src.link, () => loadSource(idx, true));
      }
    };
    loadSource(0);
  }

  // ── Click delegation (desktop only) ──────────────────────────────
  document.addEventListener('click', e => {
    if (window.innerWidth < DESKTOP_BREAKPOINT) return;
    const card = e.target.closest('.article-card');
    if (!card) return;
    if (e.target.closest('button, a, .card-edit-actions, .etki-info-btn, .analysis-toggle, .source-toggle')) return;
    const link = card.dataset.articleLink;
    const id   = card.dataset.articleId;
    const article = (window.allArticles || []).find(a =>
      (link && a.link === link) || (id && String(a.id) === id)
    );
    if (!article) return;
    e.preventDefault();
    openReader(article);
  });

  // ── Expose ───────────────────────────────────────────────────────
  window.openNewsReader = openReader;

  // ── Helpers ──────────────────────────────────────────────────────
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function getSourceLabel(s) {
    return (window.SOURCE_LABELS && window.SOURCE_LABELS[s]) || s || '';
  }
  function getFavicon(s) {
    return typeof window.getFavicon === 'function' ? window.getFavicon(s) : '';
  }
  function sanitize(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('script, style, iframe, object, embed, form, input').forEach(n => n.remove());
    return tmp.innerHTML;
  }
})();
