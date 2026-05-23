const ALLOWED_ORIGINS = [
  'https://demirbasemre.github.io',
  'http://localhost:3457',
  'http://127.0.0.1:3457',
];

// Tailscale Funnel üzerindeki fetch-proxy (ev IP'si ile çeker)
const FUNNEL_URL = 'https://tower.tail2cc03.ts.net';

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

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

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

    // Önce Tailscale Funnel üzerindeki ev proxy'sini dene
    try {
      const funnelResp = await fetch(
        `${FUNNEL_URL}/?url=${encodeURIComponent(targetUrl)}`,
        { signal: AbortSignal.timeout(15000) }
      );
      if (funnelResp.ok) {
        const contentType = funnelResp.headers.get('content-type') || 'text/html';
        const body = await funnelResp.text();
        return new Response(body, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': contentType,
            'X-Proxy': 'tailscale-funnel',
            'Cache-Control': 'public, max-age=300',
          },
        });
      }
    } catch (_) { /* funnel erişilemez — doğrudan dene */ }

    // Fallback: CF datacenter'ından doğrudan çek
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        cf: { cacheTtl: 300, cacheEverything: true },
      });

      const contentType = response.headers.get('content-type') || 'text/html';
      const body = await response.text();

      return new Response(body, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'X-Proxy': 'cf-direct',
          'X-Proxy-Status': String(response.status),
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
