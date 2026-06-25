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

// THY Kargo'nun tipik destinasyon ağındaki havalimanları (yaklaşık koordinatlar)
const CARGO_AIRPORTS = {
  LTFM: { name: 'İstanbul Havalimanı', city: 'İstanbul', lat: 41.262, lon: 28.727 },
  LTBA: { name: 'Atatürk Havalimanı', city: 'İstanbul', lat: 40.977, lon: 28.815 },
  KORD: { name: "O'Hare", city: 'Chicago', lat: 41.978, lon: -87.904 },
  KJFK: { name: 'JFK', city: 'New York', lat: 40.640, lon: -73.779 },
  KMIA: { name: 'Miami Intl', city: 'Miami', lat: 25.793, lon: -80.291 },
  KLAX: { name: 'Los Angeles Intl', city: 'Los Angeles', lat: 33.943, lon: -118.408 },
  KATL: { name: 'Hartsfield–Jackson', city: 'Atlanta', lat: 33.640, lon: -84.427 },
  KIAH: { name: 'George Bush Intercontinental', city: 'Houston', lat: 29.984, lon: -95.341 },
  KEWR: { name: 'Newark Liberty', city: 'Newark', lat: 40.692, lon: -74.169 },
  EHAM: { name: 'Schiphol', city: 'Amsterdam', lat: 52.309, lon: 4.764 },
  EDDF: { name: 'Frankfurt Havalimanı', city: 'Frankfurt', lat: 50.033, lon: 8.570 },
  EDDP: { name: 'Leipzig/Halle', city: 'Leipzig', lat: 51.424, lon: 12.236 },
  LIMC: { name: 'Malpensa', city: 'Milano', lat: 45.630, lon: 8.728 },
  LEMD: { name: 'Barajas', city: 'Madrid', lat: 40.472, lon: -3.561 },
  LOWW: { name: 'Schwechat', city: 'Viyana', lat: 48.110, lon: 16.570 },
  EBLG: { name: 'Liège Havalimanı', city: 'Liège', lat: 50.637, lon: 5.443 },
  EBBR: { name: 'Zaventem', city: 'Brüksel', lat: 50.901, lon: 4.484 },
  LFPG: { name: 'Charles de Gaulle', city: 'Paris', lat: 49.013, lon: 2.550 },
  EGLL: { name: 'Heathrow', city: 'Londra', lat: 51.470, lon: -0.454 },
  VHHH: { name: 'Hong Kong Intl', city: 'Hong Kong', lat: 22.308, lon: 113.918 },
  RKSI: { name: 'Incheon', city: 'Seul', lat: 37.469, lon: 126.451 },
  RJAA: { name: 'Narita', city: 'Tokyo', lat: 35.764, lon: 140.386 },
  RJBB: { name: 'Kansai', city: 'Osaka', lat: 34.434, lon: 135.244 },
  RJGG: { name: 'Chubu Centrair', city: 'Nagoya', lat: 34.858, lon: 136.805 },
  ZSPD: { name: 'Pudong', city: 'Şanghay', lat: 31.143, lon: 121.805 },
  ZBAA: { name: 'Pekin Başkent', city: 'Pekin', lat: 40.080, lon: 116.584 },
  RCTP: { name: 'Taoyuan', city: 'Taipei', lat: 25.077, lon: 121.233 },
  WSSS: { name: 'Changi', city: 'Singapur', lat: 1.350, lon: 103.994 },
  VIDP: { name: 'Indira Gandhi Intl', city: 'Delhi', lat: 28.556, lon: 77.100 },
  VABB: { name: 'Chhatrapati Shivaji', city: 'Mumbai', lat: 19.089, lon: 72.868 },
  VOMM: { name: 'Chennai Intl', city: 'Chennai', lat: 12.990, lon: 80.169 },
  VGHS: { name: 'Hazrat Shahjalal', city: 'Dakka', lat: 23.843, lon: 90.398 },
  OPKC: { name: 'Jinnah Intl', city: 'Karaçi', lat: 24.907, lon: 67.160 },
  OMDB: { name: 'Dubai Intl', city: 'Dubai', lat: 25.253, lon: 55.365 },
  OTHH: { name: 'Hamad Intl', city: 'Doha', lat: 25.273, lon: 51.608 },
  OERK: { name: 'King Khalid Intl', city: 'Riyad', lat: 24.957, lon: 46.699 },
  OEJN: { name: 'King Abdulaziz Intl', city: 'Cidde', lat: 21.680, lon: 39.157 },
  OEDF: { name: 'King Fahd Intl', city: 'Dammam', lat: 26.471, lon: 49.798 },
  OJAI: { name: 'Kraliçe Alia', city: 'Amman', lat: 31.722, lon: 35.993 },
  OLBA: { name: 'Rafic Hariri', city: 'Beyrut', lat: 33.821, lon: 35.488 },
  FAJS: { name: 'OR Tambo', city: 'Johannesburg', lat: -26.139, lon: 28.246 },
  HKJK: { name: 'Jomo Kenyatta', city: 'Nairobi', lat: -1.319, lon: 36.928 },
  DNMM: { name: 'Murtala Muhammed', city: 'Lagos', lat: 6.577, lon: 3.321 },
  DGAA: { name: 'Kotoka Intl', city: 'Akra', lat: 5.605, lon: -0.167 },
  HAAB: { name: 'Bole Intl', city: 'Addis Ababa', lat: 8.978, lon: 38.799 },
  HECA: { name: 'Kahire Intl', city: 'Kahire', lat: 30.122, lon: 31.406 },
  HLLT: { name: 'Trablus Intl', city: 'Trablus', lat: 32.663, lon: 13.158 },
  DAAG: { name: 'Houari Boumediene', city: 'Cezayir', lat: 36.691, lon: 3.215 },
  GMMN: { name: 'Mohammed V', city: 'Kazablanka', lat: 33.367, lon: -7.590 },
  SBGR: { name: 'Guarulhos', city: 'São Paulo', lat: -23.435, lon: -46.473 },
  SBKP: { name: 'Viracopos', city: 'Campinas', lat: -23.007, lon: -47.135 },
  SKBO: { name: 'El Dorado', city: 'Bogotá', lat: 4.702, lon: -74.147 },
  SAEZ: { name: 'Ezeiza', city: 'Buenos Aires', lat: -34.822, lon: -58.536 },
  MMMX: { name: 'Benito Juárez', city: 'Mexico City', lat: 19.436, lon: -99.072 },
  MPTO: { name: 'Tocumen Intl', city: 'Panama', lat: 9.071, lon: -79.383 },
  UUEE: { name: 'Şeremetyevo', city: 'Moskova', lat: 55.973, lon: 37.414 },
  UUWW: { name: 'Vnukovo', city: 'Moskova', lat: 55.599, lon: 37.268 },
  UAAA: { name: 'Almatı Intl', city: 'Almatı', lat: 43.352, lon: 77.041 },
  UTTT: { name: 'Taşkent Intl', city: 'Taşkent', lat: 41.258, lon: 69.282 },
};

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
        const debug = {};
        const token = await getOpenSkyToken(env, doFetch, debug);
        let flightsTest = null;
        if (token) {
          const now = Math.floor(Date.now() / 1000);
          const testRes = await doFetch(
            `https://opensky-network.org/api/flights/aircraft?icao24=4bb1c3&begin=${now - 14 * 3600}&end=${now}`,
            { headers: { Authorization: `Bearer ${token}` } }, false, 0
          );
          flightsTest = { status: testRes.status, bodySnippet: testRes.body.slice(0, 200) };
        }
        return new Response(JSON.stringify({
          hasClientId: !!env.OPENSKY_CLIENT_ID,
          hasClientSecret: !!env.OPENSKY_CLIENT_SECRET,
          tokenObtained: !!token,
          tokenLength: token ? token.length : 0,
          debug,
          flightsTest,
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // ── /cargo-flights Canlı THY Kargo Uçakları Rotası ──
    // OpenSky'nin states/all uç noktası ev Tailscale funnel'ı üzerinden ~60sn
    // sürebiliyor (büyük global ADS-B anlık görüntüsü). Bu yüzden stale-while-
    // revalidate deseni kullanılır: önbellekte veri varsa anında o döndürülür,
    // arka planda (ctx.waitUntil) tazesi çekilip önbellek güncellenir. Sadece
    // worker'ın hiç çalışmadığı ilk istek gerçek gecikmeyi yaşar.
    if (urlObj.pathname === '/cargo-flights') {
      const forceDirect = urlObj.searchParams.get('direct') === '1';
      const cache = caches.default;
      const cacheKey = new Request('https://internal.cache/cargo-flights-v1');

      // Hızlı yol: sadece states/all (anlık konum + sayım). Hiçbir koşulda
      // kullanıcıyı bekletmez — kullanıcı her zaman bu fonksiyonun sonucunu görür.
      async function computeBaseCargoFlights() {
        const token = await getOpenSkyToken(env, doFetch);
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
        // Cloudflare datacenter'larından OpenSky'ye doğrudan bağlantı engelli (522) —
        // tüm istekler ev funnel'ı üzerinden gider. Funnel, Authorization header'ını
        // upstream'e iletecek şekilde güncellendi (server.js'in ev sunucuda yeniden
        // başlatılması gerekir).
        const statesRes = await doFetch('https://opensky-network.org/api/states/all', { headers: authHeaders }, forceDirect, 50);
        if (statesRes.status !== 200) {
          throw new Error(`OpenSky states fetch failed (status ${statesRes.status})`);
        }
        const statesData = JSON.parse(statesRes.body);
        const states = statesData.states || [];

        // Havadaki tüm THY seferleri (callsign "THY" ile başlayan). Yolcu/kargo ayrımı
        // uçuş numarasına dayanan bir sezgiseldir (>=6000 kargo) — THY Kargo'nun resmi
        // uçuş numarası bloğu kamuya açık şekilde teyit edilemediğinden bazı seferler
        // yanlış sınıflanabilir.
        const allFlights = [];
        for (const s of states) {
          const callsign = (s[1] || '').trim();
          if (!callsign.startsWith('THY')) continue;
          const flightNumMatch = callsign.match(/^THY(\d+)/);
          if (!flightNumMatch) continue;
          const flightNum = parseInt(flightNumMatch[1], 10);
          const [icao24, , , , last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track] = s;
          if (on_ground || latitude == null || longitude == null) continue;
          allFlights.push({
            icao24, callsign, lat: latitude, lon: longitude,
            altitude: baro_altitude, velocity, track: true_track, lastContact: last_contact,
            type: flightNum >= 6000 ? 'cargo' : 'pax',
          });
        }

        return {
          count: allFlights.filter(f => f.type === 'cargo').length,
          paxCount: allFlights.filter(f => f.type === 'pax').length,
          flights: allFlights,
          updated: Math.floor(Date.now() / 1000),
          token, authHeaders,
        };
      }

      // Yavaş yol: kalkış/varış tahmini. SADECE arka planda (ctx.waitUntil) çalışır,
      // hiçbir HTTP yanıtı bunu beklemez. En fazla 20 kargo + 15 yolcu uçuşu
      // zenginleştirilir — OpenSky kotasını ve ev funnel'ının yükünü korumak için.
      async function enrichInBackground(data) {
        const { token, authHeaders, flights } = data;
        if (!token) return;
        const cargoFlights = flights.filter(f => f.type === 'cargo').slice(0, 20);
        const paxFlights = flights.filter(f => f.type === 'pax').slice(0, 15);
        const now = Math.floor(Date.now() / 1000);
        const begin = now - 14 * 3600;
        await Promise.all([...cargoFlights, ...paxFlights].map(async (f) => {
          try {
            const flRes = await doFetch(
              `https://opensky-network.org/api/flights/aircraft?icao24=${f.icao24}&begin=${begin}&end=${now}`,
              { headers: authHeaders }, false, 300
            );
            if (flRes.status !== 200) return;
            const flData = JSON.parse(flRes.body);
            if (!Array.isArray(flData) || !flData.length) return;
            const latest = flData[flData.length - 1];
            const depIcao = latest.estDepartureAirport || null;
            const arrIcao = latest.estArrivalAirport || null;
            f.dep = depIcao ? { icao: depIcao, ...(CARGO_AIRPORTS[depIcao] || {}) } : null;
            f.arr = arrIcao ? { icao: arrIcao, ...(CARGO_AIRPORTS[arrIcao] || {}) } : null;
          } catch (_) { /* rota tahmini başarısız — konum verisi yine de gösterilir */ }
        }));
        const { token: _t, authHeaders: _a, ...publicData } = data;
        await cache.put(cacheKey, new Response(JSON.stringify(publicData), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=70' },
        }));
      }

      async function refreshAndCache() {
        const fresh = await computeBaseCargoFlights();
        const { token: _t, authHeaders: _a, ...publicData } = fresh;
        await cache.put(cacheKey, new Response(JSON.stringify(publicData), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=70' },
        }));
        // Konum verisi hemen kullanılabilir; rota tahmini arka planda gelir.
        ctx.waitUntil(enrichInBackground(fresh).catch(() => {}));
        return publicData;
      }

      try {
        const cached = await cache.match(cacheKey);
        let data;
        if (cached) {
          data = await cached.json();
          const age = Math.floor(Date.now() / 1000) - data.updated;
          if (age > 55) {
            // Bayat veri — kullanıcıyı bekletmeden hemen döndür, tazesini arka planda çek.
            ctx.waitUntil(refreshAndCache().catch(() => {}));
          }
        } else {
          // Önbellekte hiç veri yok (ilk istek/cold start) — sadece hızlı yol beklenir,
          // rota zenginleştirmesi her zaman arka plandadır.
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
