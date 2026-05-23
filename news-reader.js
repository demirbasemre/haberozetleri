/* ═══════════════════════════════════════════════════════════════════
   Haber Okuyucu Modal — masaüstünde haber sitesini in-page açar
   Mozilla Readability.js + allorigins CORS proxy ile temiz metin + görsel
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const READABILITY_CDN = 'https://cdn.jsdelivr.net/npm/@mozilla/readability@0.5.0/Readability.js';
  const PROXY_URL = u => 'https://api.allorigins.win/get?url=' + encodeURIComponent(u);
  const DESKTOP_BREAKPOINT = 769;

  const cache = new Map(); // url → {title, content, image, byline}
  let modal = null;
  let readabilityLoaded = null;

  // ── Load Readability.js once on demand ───────────────────────────
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

  // ── Fetch + extract ──────────────────────────────────────────────
  async function extractArticle(url) {
    if (cache.has(url)) return cache.get(url);
    const [Readability] = await Promise.all([loadReadability(), 0]);

    const resp = await fetch(PROXY_URL(url), { cache: 'force-cache' });
    if (!resp.ok) throw new Error('Kaynak yüklenemedi (HTTP ' + resp.status + ')');
    const data = await resp.json();
    if (!data.contents) throw new Error('Kaynak boş döndü');

    // Parse HTML — set base URL so relative paths resolve
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    if (!doc.head.querySelector('base')) {
      const base = doc.createElement('base');
      base.href = url;
      doc.head.prepend(base);
    }

    // Lead image — try OG before Readability strips it
    const ogImage = doc.querySelector('meta[property="og:image"]')?.content
                 || doc.querySelector('meta[name="twitter:image"]')?.content
                 || doc.querySelector('article img, main img, [class*="hero"] img')?.src
                 || null;

    // Title fallback
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || doc.title;

    // Run Readability (mutates doc — pass clone)
    const docClone = doc.cloneNode(true);
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

  // ── Build modal once ─────────────────────────────────────────────
  function buildModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'reader-modal';
    modal.innerHTML = `
      <div class="reader-backdrop" data-close="1"></div>
      <div class="reader-window" role="dialog" aria-modal="true" aria-label="Haber okuyucu">
        <div class="reader-head">
          <div class="reader-head-meta">
            <div class="reader-source-tabs" id="reader-source-tabs"></div>
            <div class="reader-head-right">
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
        <div class="reader-body" id="reader-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
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
  }

  // ── Render article into modal ────────────────────────────────────
  function setLoading(sourceLabel) {
    const body = modal.querySelector('#reader-body');
    body.innerHTML = `
      <div class="reader-loading">
        <div class="reader-spinner"></div>
        <div class="reader-loading-text">
          <strong>${escapeHtml(sourceLabel || 'Kaynak')}</strong> okunuyor…
          <span class="reader-loading-sub">İçerik çıkarılıyor, gereksiz kısımlar elenip görseller yükleniyor.</span>
        </div>
      </div>
    `;
  }

  function setError(message, link) {
    const body = modal.querySelector('#reader-body');
    body.innerHTML = `
      <div class="reader-error">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div class="reader-error-title">Kaynak alınamadı</div>
        <div class="reader-error-msg">${escapeHtml(message)}</div>
        ${link ? `<a class="reader-error-link" href="${link}" target="_blank" rel="noopener noreferrer">Kaynağı yeni sekmede aç →</a>` : ''}
      </div>
    `;
  }

  function setContent(article, sourceUrl) {
    const body = modal.querySelector('#reader-body');
    body.innerHTML = `
      <article class="reader-article">
        ${article.image ? `<div class="reader-hero"><img src="${article.image}" loading="lazy" alt=""></div>` : ''}
        <h1 class="reader-title">${escapeHtml(article.title)}</h1>
        ${article.byline ? `<div class="reader-byline">${escapeHtml(article.byline)} · ${escapeHtml(article.siteName)}</div>` : `<div class="reader-byline">${escapeHtml(article.siteName)}</div>`}
        <div class="reader-content">${sanitize(article.content)}</div>
        <div class="reader-end-note">
          Mozilla Readability ile çıkarılmıştır · <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Orijinal kaynak</a>
        </div>
      </article>
    `;
    body.scrollTop = 0;
  }

  // ── Source tabs ──────────────────────────────────────────────────
  function renderSourceTabs(sources, activeIdx, onPick) {
    const wrap = modal.querySelector('#reader-source-tabs');
    if (sources.length <= 1) {
      const s = sources[0] || {};
      wrap.innerHTML = `<div class="reader-source-single">${escapeHtml(getSourceLabel(s.source) || 'Kaynak')}</div>`;
      return;
    }
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

  // ── Public API: open(article) ───────────────────────────────────
  async function openReader(article) {
    const sources = (article._sources && article._sources.length > 0)
      ? article._sources
      : [{ source: article.source, link: article.link }];

    openModal();

    let activeIdx = 0;
    const loadSource = async (idx) => {
      activeIdx = idx;
      renderSourceTabs(sources, idx, loadSource);
      const src = sources[idx];
      if (!src || !src.link) {
        setError('Bu kaynağın linki yok.');
        return;
      }
      modal.querySelector('#reader-external').href = src.link;
      setLoading(getSourceLabel(src.source));
      try {
        const result = await extractArticle(src.link);
        setContent(result, src.link);
      } catch (e) {
        setError(e.message || 'Bilinmeyen hata', src.link);
      }
    };
    loadSource(0);
  }

  // ── Click delegation (desktop only) ──────────────────────────────
  document.addEventListener('click', e => {
    if (window.innerWidth < DESKTOP_BREAKPOINT) return; // mobile: skip
    const card = e.target.closest('.article-card');
    if (!card) return;
    // Ignore interactive children
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
  // Light HTML sanitization — Readability already strips dangerous stuff,
  // but we also drop script/style/iframe just in case
  function sanitize(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('script, style, iframe, object, embed, form, input').forEach(n => n.remove());
    return tmp.innerHTML;
  }
})();
