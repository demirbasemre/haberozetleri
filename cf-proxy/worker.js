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

export default {
  async fetch(request, env) {
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
        const indexRes = await doFetch('https://www.tacindex.com/category/market-commentary/', {}, forceDirect);
        const linkMatch = indexRes.body.match(/href=["'](https?:\/\/(?:www\.)?tacindex\.com\/blog\/air-freight-rates-costs-latest-([a-z]+)-(\d{4})\/?)["']/i);
        
        let parsed = null;
        if (linkMatch && linkMatch[1]) {
          const articleRes = await doFetch(linkMatch[1], {}, forceDirect);
          parsed = parseBAFI(articleRes.body);
          if (parsed && parsed.success) {
            parsed.date = `${linkMatch[2].substring(0, 3)} ${linkMatch[3].substring(2)}`;
          }
        }

        if (!parsed || !parsed.success || parsed.price === null || isNaN(parsed.price)) {
          console.warn("BAFI canlı kazıma başarısız, n8n API'sinden fallback çekiliyor...");
          const fallbackRes = await doFetch('https://n8n.emredemirbas.com/webhook/raporlar', {}, forceDirect);
          const reportsJson = JSON.parse(fallbackRes.body);
          const latestReport = reportsJson.reports[0];
          
          let price = null;
          let change = 0;
          let direction = 'flat';
          
          // Try to match Air Freight Index from KPI (span-based markup in new reports)
          let valM = latestReport.html_content.match(/class="kpi"[^>]*>[\s\S]*?<span class="kpi-label">Air Freight Index<\/span><span class="kpi-value">([\d.,\s$/kg—]+)<\/span>/i);
          if (valM && !valM[1].includes('—')) {
            price = parseFloat(valM[1].replace(/[^\d.]/g, ''));
            const chgM = latestReport.html_content.match(/class="kpi"[^>]*>[\s\S]*?<span class="kpi-label">Air Freight Index<\/span>[\s\S]*?<span class="kpi-change"[^>]*>([^<]+)<\/span>/i);
            if (chgM) {
              change = parseFloat(chgM[1].replace(/[^\d.-]/g, ''));
              if (chgM[1].includes('▼') || chgM[1].includes('-')) change = -change;
              direction = chgM[1].includes('▲') ? 'up' : chgM[1].includes('▼') ? 'down' : 'flat';
            }
          }
          
          // If not found or empty, try Global Spot Rates KPI
          if (!price) {
            valM = latestReport.html_content.match(/class="kpi"[^>]*>[\s\S]*?<span class="kpi-label">Global Spot Rates<\/span><span class="kpi-value">([\d.,\s$/kg—]+)<\/span>/i);
            if (valM && !valM[1].includes('—')) {
              price = parseFloat(valM[1].replace(/[^\d.]/g, ''));
              const chgM = latestReport.html_content.match(/class="kpi"[^>]*>[\s\S]*?<span class="kpi-label">Global Spot Rates<\/span>[\s\S]*?<span class="kpi-change"[^>]*>([^<]+)<\/span>/i);
              if (chgM) {
                change = parseFloat(chgM[1].replace(/[^\d.-]/g, ''));
                if (chgM[1].includes('▼') || chgM[1].includes('-')) change = -change;
                direction = chgM[1].includes('▲') ? 'up' : chgM[1].includes('▼') ? 'down' : 'flat';
              }
            }
          }

          // If still not found, try old div-based metric labels
          if (!price) {
            valM = latestReport.html_content.match(/<div class="metric-label">Air Freight Index<\/div><div class="metric-value">([\d.,\s$/kg—]+)<\/div>/i);
            if (valM && !valM[1].includes('—')) {
              price = parseFloat(valM[1].replace(/[^\d.]/g, ''));
              const chgM = latestReport.html_content.match(/<div class="metric-label">Air Freight Index<\/div><div class="metric-value">[^<]+<\/div><div class="metric-change"[^>]*>([^<]+)<\/div>/i);
              if (chgM) {
                change = parseFloat(chgM[1].replace(/[^\d.-]/g, ''));
                if (chgM[1].includes('▼') || chgM[1].includes('-')) change = -change;
                direction = chgM[1].includes('▲') ? 'up' : chgM[1].includes('▼') ? 'down' : 'flat';
              }
            }
          }

          if (price) {
            parsed = {
              success: true,
              price: price,
              change: change,
              direction: direction,
              date: new Date(latestReport.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })
            };
          }
        }

        if (!parsed || !parsed.success) {
          throw new Error('BAFI parsing failed both live and fallback');
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

    // ── /fbx Canlı Rotası ──
    if (urlObj.pathname === '/fbx') {
      const forceDirect = urlObj.searchParams.get('direct') === '1';
      try {
        const updateRes = await doFetch('https://fbx.freightos.com/', {}, forceDirect);
        
        let parsed = null;
        
        // Extract ticker data from script blocks
        const tickerMatch = updateRes.body.match(/window\.frProductIntroTickerData\[[^\]]+\]\s*=\s*(\[[\s\S]*?\]);/);
        const chartMatch = updateRes.body.match(/window\.frProductIntroChartData\[[^\]]+\]\s*=\s*(\[[\s\S]*?\]);/);
        
        if (tickerMatch && tickerMatch[1]) {
          const tickerData = JSON.parse(tickerMatch[1]);
          const fbxTicker = tickerData.find(item => item.label === 'FBX');
          if (fbxTicker) {
            const priceVal = parseFloat(fbxTicker.value.replace(/[^\d.]/g, ''));
            const changeVal = parseFloat(fbxTicker.change.replace(/[^\d.-]/g, ''));
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
        const iataRes = await doFetch('https://www.iata.org/en/publications/economics/air-freight-monthly-analysis/', {}, forceDirect);
        const linkMatch = iataRes.body.match(/href=["'](https?:\/\/[^"']*?air-freight-monthly-analysis[^"']*?\.pdf)["']/i);
        
        let parsed = null;
        if (linkMatch && linkMatch[1]) {
          const pdfUrl = linkMatch[1];
          const nameMatch = pdfUrl.match(/analysis-([a-z]+)-(\d{4})/i);
          const reportMonth = nameMatch ? `${nameMatch[1]} ${nameMatch[2]}` : 'Son Rapor';
          parsed = {
            success: true,
            pdfLink: pdfUrl,
            date: reportMonth
          };
        }

        const fallbackRes = await doFetch('https://n8n.emredemirbas.com/webhook/raporlar', {}, forceDirect);
        const reportsJson = JSON.parse(fallbackRes.body);
        const latestReport = reportsJson.reports[0];
        
        const demandM = latestReport.html_content.match(/Hava Kargo Talebi<\/div>\s*<div[^>]*>([^<]+)<\/div>/i);
        const capacityM = latestReport.html_content.match(/Hava Kargo Kapasitesi<\/div>\s*<div[^>]*>([^<]+)<\/div>/i);

        parsed = {
          success: true,
          pdfLink: parsed ? parsed.pdfLink : 'https://www.iata.org/en/publications/economics/air-freight-monthly-analysis/',
          date: parsed ? parsed.date : new Date(latestReport.date).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
          demand: demandM ? demandM[1].trim() : '—',
          capacity: capacityM ? capacityM[1].trim() : '—'
        };

        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
