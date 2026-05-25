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
]);

function parseWCI(html) {
  // Raporun yayınlanma tarihini bul
  const dateMatch = html.match(/Our detailed assessment for [A-Za-z]+,\s+([\d]+\s+[A-Za-z]+\s+[\d]{4})/i);
  const dateStr = dateMatch ? dateMatch[1] : null;

  // Birincil regex eşleşmesi
  const wciRegex = /The Drewry World Container Index \(WCI\)\s+(increased|decreased|remained(?:\s+(?:steady|unchanged))?|dropped|declined|surged|fell|rose|changed)(?:\s+by)?\s*(?:([\d.]+)(?:%)?)?\s*(?:to|at)?\s*\$([\d,]+)/i;
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const urlObj = new URL(request.url);

    const FUNNEL_URL = env.FUNNEL_URL || '';

    // Çekme ve yedekleme (Funnel -> Doğrudan) mantığını gerçekleştiren yardımcı fonksiyon
    async function doFetch(url, forceDirect = false) {
      // forceDirect değilse önce Tailscale Funnel üzerindeki ev proxy'sini dene
      if (!forceDirect && FUNNEL_URL) {
        try {
          const headers = {};
          if (env.PROXY_TOKEN) {
            headers['X-Proxy-Token'] = env.PROXY_TOKEN;
          }
          const funnelResp = await fetch(
            `${FUNNEL_URL}/?url=${encodeURIComponent(url)}`,
            { 
              headers,
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
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        cf: { cacheTtl: 300, cacheEverything: true },
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
        const res = await doFetch(drewryUrl, forceDirect);
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

    try {
      const res = await doFetch(targetUrl);
      return new Response(res.body, {
        status: res.status,
        headers: {
          ...corsHeaders,
          'Content-Type': res.contentType,
          'X-Proxy': res.proxy,
          'X-Proxy-Status': String(res.status),
          'Cache-Control': 'public, max-age=300',
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
