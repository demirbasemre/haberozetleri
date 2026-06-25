const ALLOWED_ORIGINS = [
  'https://demirbasemre.github.io',
  'http://localhost:3457',
  'http://127.0.0.1:3457',
];

// Genel proxy rotası için izin verilen hostlar (SSRF koruması)
const PROXY_ALLOWED_HOSTS = new Set([
  'www.drewry.co.uk',
  'drewry.co.uk',
  'aircargonews.net',
  'www.aircargonews.net',
  'aircargoweek.com',
  'www.aircargoweek.com',
  'stattimes.com',
  'www.stattimes.com',
  'payloadasia.com',
  'www.payloadasia.com',
  'iata.org',
  'www.iata.org',
  'query1.finance.yahoo.com',
  'n8n.emredemirbas.com',
  'balticexchange.com',
  'www.balticexchange.com',
  'tacindex.com',
  'www.tacindex.com',
  'freightos.com',
  'www.freightos.com',
]);

function parseIATAFuelMonitor(html) {
  const PLATTS_CVT = 3.3173; // 1 cts/gal = 3.3173 $/MT
  const BBL_TO_MT = (100 * PLATTS_CVT) / 42; // $/bbl → $/MT (≈7.898)

  // Month lookup for date parsing
  const MONTHS = {
    january:1,february:2,march:3,april:4,may:5,june:6,
    july:7,august:8,september:9,october:10,november:11,december:12,
    jan:1,feb:2,mar:3,apr:4,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12
  };

  function parseISODate(text) {
    let m = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (m) {
      const mo = MONTHS[m[2].toLowerCase()];
      if (mo) return `${m[3]}-${String(mo).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
    }
    m = text.match(/([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/);
    if (m) {
      const mo = MONTHS[m[1].toLowerCase()];
      if (mo) return `${m[3]}-${String(mo).padStart(2,'0')}-${String(m[2]).padStart(2,'0')}`;
    }
    return null;
  }

  let price = null, change = 0, direction = 'flat';

  // Primary: "fell/rose X.X% compared to the week before to $X.XX/bbl"
  const primaryRe = /global average jet fuel price last week\s+(fell|dropped|declined|decreased|rose|increased|surged|remained\s+unchanged|was\s+unchanged)\s+(?:by\s+)?(\d+\.?\d*)?%?\s*compared to the week before to\s+\$(\d+\.?\d+)\/bbl/i;
  let match = html.match(primaryRe);
  if (match) {
    const dir = match[1].toLowerCase();
    const changeVal = match[2] ? parseFloat(match[2]) : 0;
    price = parseFloat((parseFloat(match[3]) * BBL_TO_MT).toFixed(1));
    if (['fell','dropped','declined','decreased'].some(w => dir.includes(w))) {
      change = -changeVal; direction = 'down';
    } else if (['rose','increased','surged'].some(w => dir.includes(w))) {
      change = changeVal; direction = 'up';
    }
  }

  // Fallback: any $X.XX/bbl value
  if (price === null) {
    const bblMatch = html.match(/\$(\d+\.?\d+)\/bbl/i);
    if (bblMatch) price = parseFloat((parseFloat(bblMatch[1]) * BBL_TO_MT).toFixed(1));
  }

  // Fallback: cts/gal value
  if (price === null) {
    const ctsMatch = html.match(/(\d+\.?\d+)\s*(?:cts|cents?)\/gal/i);
    if (ctsMatch) price = parseFloat((parseFloat(ctsMatch[1]) * PLATTS_CVT).toFixed(1));
  }

  if (price === null) return { success: false, error: 'Price not found in IATA fuel monitor page' };

  // Extract date — only trust patterns explicitly anchored to "week of/ending" or "as of/dated".
  // The page embeds the actual data date inside a chart image, not as text, so a generic
  // "any date on the page" fallback previously latched onto unrelated dates elsewhere on the
  // page (e.g. an AGM event mention) and produced a bogus, too-old date.
  let dateISO = null;
  const datePatterns = [
    /week\s+(?:of|ending)\s+([\d]+\s+[A-Za-z]+\s+\d{4})/i,
    /for\s+(?:the\s+)?week\s+(?:of|ending)\s+([\d]+\s+[A-Za-z]+\s+\d{4})/i,
    /(?:as\s+of|dated?)\s+([\d]+\s+[A-Za-z]+\s+\d{4})/i,
  ];
  for (const p of datePatterns) {
    const dm = html.match(p);
    if (dm) {
      dateISO = parseISODate(dm[1]);
      if (dateISO) break;
    }
  }

  // No explicit date on the page: IATA publishes "last week" data, i.e. the most recently
  // completed week ending Friday. Use the most recent Friday on/before the fetch date.
  if (!dateISO) {
    const now = new Date();
    const day = now.getUTCDay(); // 0=Sun..6=Sat
    const diffToFri = (day - 5 + 7) % 7;
    now.setUTCDate(now.getUTCDate() - diffToFri);
    dateISO = now.toISOString().slice(0, 10);
  }

  return { success: true, price, change, direction, date: dateISO };
}

function parseWCI(html) {
  // Raporun yayınlanma tarihini bul
  const dateMatch = html.match(/Our detailed assessment for [A-Za-z]+,\s+([\d]+\s+[A-Za-z]+\s+[\d]{4})/i);
  const dateStr = dateMatch ? dateMatch[1] : null;

  // Birincil regex eşleşmesi (aradaki açıklama veya virgülleri tolere etmek için [^]*? kullanıldı)
  const wciRegex = /The Drewry World Container Index \(WCI\)[^]*?(increased|decreased|remained(?:\s+(?:steady|unchanged))?|dropped|declined|surged|fell|rose|changed)(?:\s+by)?\s*(?:([\d.]+)(?:%)?)?\s*(?:to|at)?\s*\$([\d,]+)/i;
  let match = html.match(wciRegex);

  // Alternatif regex 1: "composite index" ifadeleri için
  if (!match) {
    const fallbackRegex = /composite index\s+(increased|decreased|remained(?:\s+(?:steady|unchanged))?|dropped|declined|surged|fell|rose|changed)(?:\s+by)?\s*(?:([\d.]+)(?:%)?)?\s*(?:to|at)?\s*\$([\d,]+)/i;
    match = html.match(fallbackRegex);
  }

  if (!match) {
    return {
      success: false,
      error: 'Could not find WCI match'
    };
  }

  const directionStr = match[1].toLowerCase();
  const changePercentVal = match[2] ? parseFloat(match[2]) : 0;
  const priceStr = match[3].replace(/,/g, '');
  const price = parseFloat(priceStr);

  let changePercent = changePercentVal;
  if (['decreased', 'dropped', 'declined', 'fell'].includes(directionStr)) {
    changePercent = -changePercentVal;
  }

  return {
    success: true,
    price,
    change: changePercent,
    date: dateStr,
    direction: ['increased', 'surged', 'rose'].includes(directionStr) ? 'up' : ['decreased', 'dropped', 'declined', 'fell'].includes(directionStr) ? 'down' : 'flat'
  };
}

function parseBAFI(html) {
  const indexRegex = /BAI00[^]*?(?:was\s+)?(increased|decreased|dropped|rose|fell|changed|up|down)(?:\s+by)?\s*(?:([\d.]+)(?:%)?)?\s*(?:to|at)?\s*(?:[\$]?)([\d,.]+)/i;
  const match = html.match(indexRegex);
  
  if (!match) {
    const fallbackRegex = /Baltic Air Freight Index[^]*?(?:[\$]?)([\d,.]+)/i;
    const fallbackMatch = html.match(fallbackRegex);
    if (fallbackMatch) {
      return {
        success: true,
        price: parseFloat(fallbackMatch[1].replace(/,/g, '')),
        change: 0,
        direction: 'flat'
      };
    }
    return { success: false, error: 'Could not parse BAFI values' };
  }

  const directionStr = match[1].toLowerCase();
  const changePercentVal = match[2] ? parseFloat(match[2]) : 0;
  const price = parseFloat(match[3].replace(/,/g, ''));
  
  let changePercent = changePercentVal;
  let direction = 'flat';
  if (['decreased', 'dropped', 'declined', 'fell', 'down'].includes(directionStr)) {
    changePercent = -changePercentVal;
    direction = 'down';
  } else if (['increased', 'surged', 'rose', 'up'].includes(directionStr)) {
    direction = 'up';
  }

  return {
    success: true,
    price,
    change: changePercent,
    direction
  };
}

function parseFBX(html) {
  const fbxRegex = /Freightos Baltic Index \(FBX\) composite[^]*?(increased|decreased|dropped|rose|fell|changed|up|down)(?:\s+by)?\s*(?:([\d.]+)(?:%)?)?\s*(?:to|at)?\s*(?:\$)([\d,]+)/i;
  let match = html.match(fbxRegex);

  if (!match) {
    const fallbackRegex = /FBX composite[^]*?(?:[\$])([\d,]+)/i;
    match = html.match(fallbackRegex);
    if (match) {
      return {
        success: true,
        price: parseFloat(match[1].replace(/,/g, '')),
        change: 0,
        direction: 'flat'
      };
    }
    return { success: false, error: 'Could not parse FBX values' };
  }

  const directionStr = match[1].toLowerCase();
  const changePercentVal = match[2] ? parseFloat(match[2]) : 0;
  const price = parseFloat(match[3].replace(/,/g, ''));

  let changePercent = changePercentVal;
  let direction = 'flat';
  if (['decreased', 'dropped', 'declined', 'fell', 'down'].includes(directionStr)) {
    changePercent = -changePercentVal;
    direction = 'down';
  } else if (['increased', 'surged', 'rose', 'up'].includes(directionStr)) {
    direction = 'up';
  }

  return {
    success: true,
    price,
    change: changePercent,
    direction
  };
}

// OpenSky OAuth2 (client_credentials) token önbelleği — Worker isolate'ı yaşadığı
// sürece bellekte kalır, süresi dolmadan tekrar token istemez.
let _openSkyToken = null; // { accessToken, expiresAt (epoch ms) }

async function getOpenSkyToken(env, doFetch, debug) {
  if (!env.OPENSKY_CLIENT_ID || !env.OPENSKY_CLIENT_SECRET) return null;
  if (_openSkyToken && _openSkyToken.expiresAt > Date.now() + 10000) {
    return _openSkyToken.accessToken;
  }
  // Cloudflare datacenter'larından OpenSky'ye doğrudan bağlantı engelli (522);
  // token isteği de ev funnel'ı üzerinden gönderilir.
  const res = await doFetch('https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.OPENSKY_CLIENT_ID,
      client_secret: env.OPENSKY_CLIENT_SECRET,
    }).toString(),
  }, false, 0);
  if (res.status !== 200) {
    if (debug) debug.tokenError = { status: res.status, body: res.body.slice(0, 300) };
    return null;
  }
  let data;
  try { data = JSON.parse(res.body); } catch (e) {
    if (debug) debug.tokenError = { parseError: e.message, body: res.body.slice(0, 300) };
    return null;
  }
  if (!data.access_token) {
    if (debug) debug.tokenError = { noAccessToken: true, data };
    return null;
  }
  _openSkyToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 1800) * 1000,
  };
  return _openSkyToken.accessToken;
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const urlObj = new URL(request.url);

    const FUNNEL_URL = env.FUNNEL_URL || '';

    // Çekme ve yedekleme (Funnel -> Doğrudan) mantığını gerçekleştiren yardımcı fonksiyon
    async function doFetch(url, options = {}, forceDirect = false, customTtl = 300) {
      // forceDirect değilse önce Tailscale Funnel üzerindeki ev proxy'sini dene
      if (!forceDirect && FUNNEL_URL) {
        try {
          const headers = { ...options.headers };
          if (env.PROXY_TOKEN) {
            headers['X-Proxy-Token'] = env.PROXY_TOKEN;
          }
          const funnelResp = await fetch(
            `${FUNNEL_URL}/?url=${encodeURIComponent(url)}`,
            { 
              method: options.method || 'GET',
              headers,
              body: options.body,
              signal: AbortSignal.timeout(15000) 
            }
          );
          if (funnelResp.ok) {
            const body = await funnelResp.text();
            return {
              body,
              proxy: 'tailscale-funnel',
              status: funnelResp.status,
              contentType: funnelResp.headers.get('content-type') || 'text/html'
            };
          }
        } catch (_) { /* funnel erişilemez veya hata verdi — doğrudan dene */ }
      }

      // Fallback: CF datacenter'ından doğrudan çek
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          ...options.headers
        },
        body: options.body,
        redirect: 'follow',
        cf: (options.method || 'GET') === 'GET' ? { cacheTtl: customTtl, cacheEverything: true } : undefined,
      });

      const body = await response.text();
      return {
        body,
        proxy: 'cf-direct',
        status: response.status,
        contentType: response.headers.get('content-type') || 'text/html'
      };
    }

    // ── /wci Özel Rotası ──
    if (urlObj.pathname === '/wci' || urlObj.searchParams.get('wci') === '1') {
      const drewryUrl = 'https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry';
      const forceDirect = urlObj.searchParams.get('direct') === '1';
      try {
        const res = await doFetch(drewryUrl, {}, forceDirect);
        if (res.status !== 200) {
          return new Response(JSON.stringify({ error: 'Drewry page fetch failed', status: res.status }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const parsed = parseWCI(res.body);
        if (!parsed || !parsed.success) {
          return new Response(JSON.stringify({ error: 'Could not parse WCI data', detail: parsed ? parsed.error : 'unknown' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Proxy': res.proxy,
            'Cache-Control': 'public, max-age=3600', // 1 saat önbelleğe al (Drewry haftalık güncellenir)
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── /bafi Canlı Rotası ──
    if (urlObj.pathname === '/bafi') {
      const forceDirect = urlObj.searchParams.get('direct') === '1';
      try {
        // TAC Index Dashboard API — resmi BAI00 verisi
        const tacApiUrl = 'https://dashboard-api.tacindex.com/api/routes_details?token=&routes=BAI00&currency=USD&index=BAI00&type=absolute&time_frame=1M';
        const apiRes = await doFetch(tacApiUrl, {
          headers: { 'Authorization': '2a9c56f7-a0bd-4550-a64b-3672ed26ae03', 'Accept': 'application/json' }
        }, forceDirect, 3600);

        const apiData = JSON.parse(apiRes.body);
        if (!apiData.success || !apiData.routes_details?.[0]?.route_data?.index?.[0]) {
          throw new Error('TAC API: geçersiz yanıt');
        }

        const rd = apiData.routes_details[0];
        const idx = rd.route_data.index[0];
        const changeAbs = parseFloat(idx.change_1w.absolute);
        const chartData = rd.chart_data?.[0];

        const parsed = {
          success: true,
          price: Math.round(parseFloat(idx.price)),
          change: parseFloat(idx.change_1w.percentage),
          direction: changeAbs > 0 ? 'up' : changeAbs < 0 ? 'down' : 'flat',
          date: idx.date,
          change_52w: parseFloat(idx.change_52w.percentage),
          fetchedAt: Math.floor(Date.now() / 1000),
          history: chartData ? { dates: chartData.date, values: chartData.absolute } : null
        };

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── /fbx Canlı Rotası ──
    if (urlObj.pathname === '/fbx') {
      const forceDirect = urlObj.searchParams.get('direct') === '1';
      try {
        const updateRes = await doFetch('https://fbx.freightos.com/', {}, forceDirect);

        let parsed = null;
        let routes = null;

        // Extract ticker data from script blocks
        const tickerMatch = updateRes.body.match(/window\.frProductIntroTickerData\[[^\]]+\]\s*=\s*(\[[\s\S]*?\]);/);
        const chartMatch = updateRes.body.match(/window\.frProductIntroChartData\[[^\]]+\]\s*=\s*(\[[\s\S]*?\]);/);

        if (tickerMatch && tickerMatch[1]) {
          const tickerData = JSON.parse(tickerMatch[1]);
          const fbxTicker = tickerData.find(item => item.label === 'FBX');
          if (fbxTicker) {
            const priceVal = parseFloat(fbxTicker.value.replace(/[^\d.]/g, ''));
            const changeVal = parseFloat(fbxTicker.change.replace(/[^\d.-]/g, ''));
            const todayIso = new Date().toISOString().slice(0, 10);
            parsed = {
              success: true,
              price: priceVal,
              change: isNaN(changeVal) ? 0 : changeVal,
              direction: fbxTicker.positive ? 'up' : (changeVal < 0 ? 'down' : 'flat'),
              date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
            };

            if (chartMatch && chartMatch[1]) {
              const chartData = JSON.parse(chartMatch[1]);
              parsed.history = chartData.map(d => ({
                date: d.indexDate,
                value: d.value
              }));
            }

            // Rota bazlı (FBX01, FBX11, vb.) anlık değerleri çıkar
            routes = {};
            tickerData.forEach(item => {
              if (item.label === 'FBX') return;
              const rPrice = parseFloat(String(item.value).replace(/[^\d.]/g, ''));
              const rChange = parseFloat(String(item.change).replace(/[^\d.-]/g, ''));
              if (isNaN(rPrice)) return;
              routes[item.label] = {
                price: rPrice,
                change: isNaN(rChange) ? 0 : rChange,
                direction: item.positive ? 'up' : (rChange < 0 ? 'down' : 'flat')
              };
            });

            // Cloudflare KV ile rota bazlı geçmişi kalıcı olarak biriktir.
            // Freightos sadece anlık değer + haftalık % değişim veriyor; geçmiş tarih serisi yok.
            // Bu yüzden %değişimden önceki haftayı geriye hesaplayıp ilk veriyi 2 noktalı başlatıyoruz,
            // sonraki her haftalık çekimde son haftayı diziye ekliyoruz (büyüyen geçmiş).
            if (env.FBX_ROUTES_KV) {
              try {
                const stored = await env.FBX_ROUTES_KV.get('fbx_routes_history', { type: 'json' }) || {};
                let changed = false;
                Object.entries(routes).forEach(([code, r]) => {
                  const prevValue = r.change !== 0 ? r.price / (1 + r.change / 100) : r.price;
                  const prevDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                  if (!stored[code] || !stored[code].length) {
                    stored[code] = [
                      { date: prevDate, value: Math.round(prevValue * 100) / 100 },
                      { date: todayIso, value: r.price }
                    ];
                    changed = true;
                  } else {
                    const last = stored[code][stored[code].length - 1];
                    if (last.date !== todayIso) {
                      stored[code].push({ date: todayIso, value: r.price });
                      changed = true;
                    } else if (last.value !== r.price) {
                      last.value = r.price;
                      changed = true;
                    }
                  }
                });
                if (changed) {
                  await env.FBX_ROUTES_KV.put('fbx_routes_history', JSON.stringify(stored));
                }
                parsed.routesHistory = stored;
              } catch (kvErr) {
                console.warn('FBX routes KV hatası:', kvErr.message);
              }
            }

            parsed.routes = routes;
            parsed.routeNames = {
              FBX01: 'Çin/D.Asya → K.Amerika Batı Kıyısı',
              FBX02: 'K.Amerika Batı Kıyısı → Çin/D.Asya',
              FBX03: 'Çin/D.Asya → K.Amerika Doğu Kıyısı',
              FBX04: 'K.Amerika Doğu Kıyısı → Çin/D.Asya',
              FBX11: 'Çin/D.Asya → K.Avrupa',
              FBX12: 'K.Avrupa → Çin/D.Asya',
              FBX13: 'Çin/D.Asya → Akdeniz',
              FBX14: 'Akdeniz → Çin/D.Asya',
              FBX21: 'K.Amerika D.Kıyısı → K.Avrupa',
              FBX22: 'K.Avrupa → K.Amerika D.Kıyısı',
              FBX24: 'Avrupa → G.Amerika D.Kıyısı',
              FBX26: 'Avrupa → G.Amerika B.Kıyısı'
            };
          }
        }

        if (!parsed || !parsed.success) {
          console.warn("FBX canlı kazıma başarısız, n8n API'sinden fallback çekiliyor...");
          const fallbackRes = await doFetch('https://n8n.emredemirbas.com/webhook/raporlar', {}, forceDirect);
          const reportsJson = JSON.parse(fallbackRes.body);
          const latestReport = reportsJson.reports[0];

          // Try to match WCI as a fallback container index
          const wciValM = latestReport.html_content.match(/WCI Bileşik Endeks<\/div>\s*<div[^>]*>([\d.,\s$%-]+)<\/div>/i) ||
                          latestReport.html_content.match(/class="kpi"[^>]*>[\s\S]*?<span class="kpi-label">Drewry WCI<\/span><span class="kpi-value">([\d.,\s$/kg—]+)<\/span>/i);

          if (wciValM) {
            parsed = {
              success: true,
              price: parseFloat(wciValM[1].trim().replace(/[^\d.]/g, '')),
              change: 0,
              direction: 'flat',
              date: new Date(latestReport.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })
            };
          }
        }

        if (!parsed || !parsed.success) {
          throw new Error('FBX parsing failed both live and fallback');
        }

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── /iata Canlı Rotası ──
    if (urlObj.pathname === '/iata') {
      const forceDirect = urlObj.searchParams.get('direct') === '1';
      try {
        // 1. Scrape main portal to get latest monthly report link
        const portalRes = await doFetch('https://www.iata.org/en/publications/economics/', {}, forceDirect);
        const linkMatch = portalRes.body.match(/href=["']([^"']*?\/reports\/air-cargo-market-analysis-([a-z]+)-(\d{4})\/?)/i);
        
        let reportUrl = 'https://www.iata.org/en/publications/economics/';
        let reportMonth = '';
        if (linkMatch) {
          reportUrl = linkMatch[1];
          if (!reportUrl.startsWith('http')) {
            reportUrl = 'https://www.iata.org' + (reportUrl.startsWith('/') ? '' : '/') + reportUrl;
          }
          const monthsTr = {
            january: 'Ocak', february: 'Şubat', march: 'Mart', april: 'Nisan',
            may: 'Mayıs', june: 'Haziran', july: 'Temmuz', august: 'Ağustos',
            september: 'Eylül', october: 'Ekim', november: 'Kasım', december: 'Aralık'
          };
          const monthEn = linkMatch[2].toLowerCase();
          const year = linkMatch[3];
          reportMonth = `${monthsTr[monthEn] || monthEn} ${year}`;
        }

        // 2. Fetch n8n webhook reports to get parsed metrics & summaries
        const fallbackRes = await doFetch('https://n8n.emredemirbas.com/webhook/raporlar', {}, forceDirect);
        const reportsJson = JSON.parse(fallbackRes.body);
        
        // Find the latest report that actually has parsed metrics (not placeholders like '—')
        const latestReport = (reportsJson.reports || []).find(r => {
          const html = r.html_content || '';
          const hasDemand = html.includes('Hava Kargo Talebi') && 
            !html.match(/<span class="kpi-label">\s*Hava Kargo Talebi\s*<\/span>\s*<span class="kpi-value">\s*—\s*<\/span>/i) && 
            !html.match(/<div class="metric-label">\s*Hava Kargo Talebi\s*<\/div>\s*<div class="metric-value">\s*—\s*<\/div>/i);
          return hasDemand;
        }) || (reportsJson.reports && reportsJson.reports[0]);
        
        // Helper to extract values from HTML content
        const html = latestReport.html_content || '';
        function extractVal(label) {
          const escapedLabel = label.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          // Try metric-card
          let m = html.match(new RegExp(`<div class="metric-label">\\s*${escapedLabel}\\s*<\/div>\\s*<div class="metric-value">([^<]+)<\/div>`, 'i'));
          if (m) return m[1].trim();
          // Try kpi
          m = html.match(new RegExp(`<span class="kpi-label">\\s*${escapedLabel}\\s*<\/span>\\s*<span class="kpi-value">([^<]+)<\/span>`, 'i'));
          if (m) return m[1].trim();
          return '—';
        }

        const demand = extractVal('Hava Kargo Talebi');
        const capacity = extractVal('Hava Kargo Kapasitesi');
        const loadFactor = extractVal('Yük Faktörü (CLF)') !== '—' ? extractVal('Yük Faktörü (CLF)') : extractVal('Yük Faktörü');
        const spotRate = extractVal('Global Spot Rates') !== '—' ? extractVal('Global Spot Rates') : extractVal('Air Freight Index');

        // Extract IATA summary from Section 4 summary-box
        const sec4Match = html.match(/id="sec-4"[^>]*>[\s\S]*?<div class="summary-box"><strong>ÖZET<\/strong>\s*([\s\S]*?)<\/div>/i) ||
                           html.match(/id="sec-2"[^>]*>[\s\S]*?<div class="summary-box"><strong>ÖZET<\/strong>\s*([\s\S]*?)<\/div>/i);
        let summary = sec4Match ? sec4Match[1].replace(/<[^>]+>/g, '').trim() : '';
        if (!summary) {
          const execMatch = html.match(/<h2>📋 Yönetici Özeti<\/h2>\s*<p>([\s\S]*?)<\/p>/i);
          summary = execMatch ? execMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        }

        const finalDate = reportMonth || new Date(latestReport.date).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

        const parsed = {
          success: true,
          pdfLink: reportUrl,
          date: finalDate,
          demand: demand,
          capacity: capacity,
          loadFactor: loadFactor,
          spotRate: spotRate,
          summary: summary
        };

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400',
            'X-Scraped-Url': reportUrl
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── /jetfuel IATA Fuel Monitor Rotası ──
    if (urlObj.pathname === '/jetfuel') {
      const forceDirect = urlObj.searchParams.get('direct') === '1';
      try {
        const res = await doFetch(
          'https://www.iata.org/en/publications/economics/fuel-monitor/',
          { headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' } },
          forceDirect,
          21600 // 6 saat önbellek — veri haftalık güncellenir
        );
        if (res.status !== 200) {
          return new Response(JSON.stringify({ error: 'IATA fetch failed', status: res.status }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const parsed = parseIATAFuelMonitor(res.body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error || 'Parse failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Proxy': res.proxy,
            'Cache-Control': 'public, max-age=21600',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── GEÇICI: OpenSky OAuth2 teşhis rotası (debug, secret sızdırmaz) ──
    if (urlObj.pathname === '/cargo-debug') {
      try {
        const cs = urlObj.searchParams.get('callsign') || 'THY6354';
        const adsbRes = await doFetch(`https://api.adsbdb.com/v0/callsign/${cs}`, {}, false, 0);
        let parsed = null, parseError = null;
        try { parsed = JSON.parse(adsbRes.body); } catch (e) { parseError = e.message; }
        return new Response(JSON.stringify({
          callsign: cs,
          adsbStatus: adsbRes.status,
          adsbProxy: adsbRes.proxy,
          bodySnippet: adsbRes.body.slice(0, 400),
          parsed,
          parseError,
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // ── /cargo-flights Canlı THY Kargo Uçakları Rotası ──
    if (urlObj.pathname === '/cargo-flights') {
      const forceDirect = urlObj.searchParams.get('direct') === '1';
      const cacheKey = new Request('https://internal.cache/cargo-flights-v1');
      const kvKey = 'cargo_flights_cache_v1';

      async function getCachedFlights() {
        if (env.FBX_ROUTES_KV) {
          try {
            const data = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' });
            if (data) return data;
          } catch (_) {}
        }
        try {
          const cached = await caches.default.match(cacheKey);
          if (cached) return await cached.json();
        } catch (_) {}
        return null;
      }

      async function setCachedFlights(publicData) {
        if (env.FBX_ROUTES_KV) {
          try {
            await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(publicData));
          } catch (_) {}
        }
        try {
          await caches.default.put(cacheKey, new Response(JSON.stringify(publicData), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=70' },
          }));
        } catch (_) {}
      }

      async function computeBaseCargoFlights() {
        const token = await getOpenSkyToken(env, doFetch);
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
        const statesRes = await doFetch('https://opensky-network.org/api/states/all', { headers: authHeaders }, forceDirect, 50);
        if (statesRes.status !== 200) {
          throw new Error(`OpenSky states fetch failed (status ${statesRes.status})`);
        }
        const statesData = JSON.parse(statesRes.body);
        const states = statesData.states || [];

        const allFlights = [];
        for (const s of states) {
          const callsign = (s[1] || '').trim();
          if (!callsign.startsWith('THY')) continue;
          const flightNumMatch = callsign.match(/^THY(\d+)/);
          if (!flightNumMatch) continue;
          const flightNum = parseInt(flightNumMatch[1], 10);
          const [icao24, , origin_country, , last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, , geo_altitude, squawk] = s;
          if (on_ground || latitude == null || longitude == null) continue;
          allFlights.push({
            icao24, callsign, lat: latitude, lon: longitude,
            altitude: baro_altitude, geoAltitude: geo_altitude, velocity, track: true_track,
            verticalRate: vertical_rate, squawk: squawk || null, originCountry: origin_country || null,
            lastContact: last_contact,
            type: flightNum >= 6000 ? 'cargo' : 'pax',
          });
        }

        function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      }

      async function getLearnedRoute(callsign, lat, lon) {
        if (!env.FBX_ROUTES_KV) return null;
        const kvKey = `learned_routes_${callsign}`;
        try {
          const routes = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' }) || [];
          for (const r of routes) {
            if (r.dep && r.dep.lat != null && r.arr && r.arr.lat != null) {
              const dDep = getDistance(lat, lon, r.dep.lat, r.dep.lon);
              const dArr = getDistance(lat, lon, r.arr.lat, r.arr.lon);
              const dTotal = getDistance(r.dep.lat, r.dep.lon, r.arr.lat, r.arr.lon);
              const maxAllowed = Math.max(dTotal * 1.35, dTotal + 800);
              if (dDep + dArr <= maxAllowed) {
                return r; // Rota eşleşti!
              }
            }
          }
        } catch (_) {}
        return null;
      }

      async function saveLearnedRoute(callsign, route) {
        if (!env.FBX_ROUTES_KV || !route || !route.dep || !route.arr) return;
        const kvKey = `learned_routes_${callsign}`;
        try {
          const routes = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' }) || [];
          const exists = routes.some(r => r.dep.icao === route.dep.icao && r.arr.icao === route.arr.icao);
          if (!exists) {
            routes.push(route);
            if (routes.length > 5) routes.shift(); // En son 5 rotayı tut
            await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(routes));
          }
        } catch (_) {}
      }

      async function fetchAircraftDetailsFromAdsbdb(icao24) {
        const uppercaseIcao = icao24.toUpperCase();
        const kvKey = `aircraft_details_${uppercaseIcao}`;
        if (env.FBX_ROUTES_KV) {
          try {
            const cached = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' });
            if (cached) return cached;
          } catch (_) {}
        }
        
        const res = await doFetch(`https://api.adsbdb.com/v0/aircraft/${uppercaseIcao}`, {}, false, 86400);
        if (res.status !== 200) return null;
        let data;
        try { data = JSON.parse(res.body); } catch { return null; }
        const ac = data?.response?.aircraft;
        if (!ac) return null;
        
        const details = {
          registration: ac.registration || null,
          type: ac.type || null,
          icaoType: ac.icao_type || null,
          manufacturer: ac.manufacturer || null,
          photoUrl: ac.url_photo || null,
          photoThumb: ac.url_photo_thumbnail || null,
        };
        
        if (env.FBX_ROUTES_KV && details.registration) {
          try {
            await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(details));
          } catch (_) {}
        }
        return details;
      }

      async function fetchRouteFromAdsbdb(callsign) {
        const res = await doFetch(`https://api.adsbdb.com/v0/callsign/${callsign}`, {}, false, 21600);
        if (res.status !== 200) return null;
        let data;
        try { data = JSON.parse(res.body); } catch { return null; }
        const route = data?.response?.flightroute;
        if (!route) return null;
        const toAirport = (a) => a ? {
          icao: a.icao_code, iata: a.iata_code, name: a.name,
          city: a.municipality, lat: a.latitude, lon: a.longitude,
        } : null;
        return { dep: toAirport(route.origin), arr: toAirport(route.destination) };
      }

      async function enrichInBackground(data, cachedFlights) {
        const { flights } = data;
        const cargoFlights = flights.filter(f => f.type === 'cargo');
        let cacheUpdated = false;
        
        for (const f of cargoFlights) {
          // 1. Rota tespiti (Hafızadan/API'den teyitli)
          if (!f.dep) {
            // Önce kendi KV'mizden öğrenilmiş rotaları kontrol et
            const learnedRoute = await getLearnedRoute(f.callsign, f.lat, f.lon);
            if (learnedRoute) {
              f.dep = learnedRoute.dep;
              f.arr = learnedRoute.arr;
              cacheUpdated = true;
            } else {
              // KV'de yoksa API'den çek ve teyit et
              try {
                const apiRoute = await fetchRouteFromAdsbdb(f.callsign);
                if (apiRoute && apiRoute.dep && apiRoute.arr) {
                  const dDep = getDistance(f.lat, f.lon, apiRoute.dep.lat, apiRoute.dep.lon);
                  const dArr = getDistance(f.lat, f.lon, apiRoute.arr.lat, apiRoute.arr.lon);
                  const dTotal = getDistance(apiRoute.dep.lat, apiRoute.dep.lon, apiRoute.arr.lat, apiRoute.arr.lon);
                  const maxAllowed = Math.max(dTotal * 1.35, dTotal + 800);
                  
                  if (dDep + dArr <= maxAllowed) {
                    f.dep = apiRoute.dep;
                    f.arr = apiRoute.arr;
                    cacheUpdated = true;
                    // Başarılıysa KV'ye öğrenilmiş rota olarak kaydet
                    await saveLearnedRoute(f.callsign, apiRoute);
                  }
                }
              } catch (_) {}
              await new Promise(r => setTimeout(r, 1200));
            }
          }

          // 2. Uçak detaylarını (Tescil, Model, Fotoğraf) çek
          if (!f.aircraftDetails) {
            try {
              const acDetails = await fetchAircraftDetailsFromAdsbdb(f.icao24);
              if (acDetails) {
                f.aircraftDetails = acDetails;
                cacheUpdated = true;
              }
            } catch (_) {}
            await new Promise(r => setTimeout(r, 1200));
          }
        }
        
        if (cacheUpdated) {
          const { token: _t, authHeaders: _a, ...publicData } = data;
          await setCachedFlights(publicData);
        }
      }

      async function refreshAndCache() {
        const fresh = await computeBaseCargoFlights();
        
        let cachedFlights = [];
        try {
          const cachedData = await getCachedFlights();
          if (cachedData) {
            cachedFlights = cachedData.flights || [];
            for (const f of fresh.flights) {
              const prev = cachedFlights.find(p => p.callsign === f.callsign);
              if (prev) {
                if (prev.dep) {
                  f.dep = prev.dep;
                  f.arr = prev.arr;
                }
                if (prev.aircraftDetails) {
                  f.aircraftDetails = prev.aircraftDetails;
                }
              }
            }
          }
        } catch (_) {}

        const { token: _t, authHeaders: _a, ...publicData } = fresh;
        await setCachedFlights(publicData);
        ctx.waitUntil(enrichInBackground(fresh, cachedFlights).catch(() => {}));
        return publicData;
      }

      try {
        const cachedData = await getCachedFlights();
        let data;
        if (cachedData) {
          data = cachedData;
          const age = Math.floor(Date.now() / 1000) - data.updated;
          if (age > 55) {
            ctx.waitUntil(refreshAndCache().catch(() => {}));
          }
        } else {
          data = await refreshAndCache();
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Genel Proxy Rotası ──
    const targetUrl = urlObj.searchParams.get('url');
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'url param required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return new Response(JSON.stringify({ error: 'invalid url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return new Response(JSON.stringify({ error: 'protocol not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!PROXY_ALLOWED_HOSTS.has(parsed.hostname)) {
      return new Response(JSON.stringify({ error: 'host not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reqHeaders = {};
    const contentType = request.headers.get('content-type');
    if (contentType) {
      reqHeaders['Content-Type'] = contentType;
    }

    let requestBody = null;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      requestBody = await request.text();
    }

    try {
      let customTtl = 300; // default 5 minutes
      if (parsed.hostname === 'query1.finance.yahoo.com') {
        if (parsed.searchParams.get('range') === '1d') {
          customTtl = 30; // 30 seconds for intraday real-time charts/prices
        }
      }
      const res = await doFetch(targetUrl, {
        method: request.method,
        headers: reqHeaders,
        body: requestBody
      }, false, customTtl);
      return new Response(res.body, {
        status: res.status,
        headers: {
          ...corsHeaders,
          'Content-Type': res.contentType,
          'X-Proxy': res.proxy,
          'X-Proxy-Status': String(res.status),
          'Cache-Control': `public, max-age=${customTtl}`,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
