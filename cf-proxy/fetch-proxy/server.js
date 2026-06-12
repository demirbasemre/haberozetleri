const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = 3100;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function fetchUrl(targetUrl, incomingReq, res) {
  let parsed;
  try { parsed = new URL(targetUrl); } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'invalid url' }));
  }

  const isN8N = parsed.hostname === 'n8n.emredemirbas.com';
  
  // Gelen Content-Type başlığını ve varsayılan başlıkları birleştirelim
  const requestHeaders = {
    ...HEADERS,
  };
  
  const incomingContentType = incomingReq.headers['content-type'];
  if (incomingContentType) {
    requestHeaders['Content-Type'] = incomingContentType;
  }
  
  if (isN8N) {
    requestHeaders['Host'] = 'n8n.emredemirbas.com';
  }

  const lib = (isN8N || parsed.protocol === 'https:') ? https : http;
  
  const options = {
    method: incomingReq.method,
    headers: requestHeaders,
    path: parsed.pathname + parsed.search,
  };

  if (isN8N) {
    options.hostname = '192.168.3.100';
    options.port = 5083;
    options.rejectUnauthorized = false; // Yerel SSL sertifika hatalarını yok say
  } else {
    options.hostname = parsed.hostname;
    options.port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80);
  }

  const req = lib.request(options, upstream => {
    // Yönlendirmeleri takip et (maksimum 5)
    if ([301, 302, 303, 307, 308].includes(upstream.statusCode) && upstream.headers.location) {
      return fetchUrl(upstream.headers.location, incomingReq, res);
    }
    
    // CORS başlıkları ile birlikte yanıt yaz
    res.writeHead(upstream.statusCode, {
      'Content-Type': upstream.headers['content-type'] || 'text/html',
      'Access-Control-Allow-Origin': '*',
      'X-Proxy-Status': String(upstream.statusCode),
      'Cache-Control': 'public, max-age=300',
    });
    upstream.pipe(res);
  });

  req.on('error', err => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  req.setTimeout(15000, () => { req.destroy(); });
  
  // Gelen istek gövdesini (body) upstream sunucusuna ilet
  incomingReq.pipe(req);
}

const server = http.createServer((req, res) => {
  // CORS ön uçuş (preflight) istekleri
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Proxy-Token'
    });
    return res.end();
  }

  // Token doğrulama (Token verification)
  const expectedToken = process.env.PROXY_TOKEN;
  if (!expectedToken) {
    console.error("HATA: PROXY_TOKEN çevre değişkeni (environment variable) ayarlanmamış!");
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Proxy server configuration error: PROXY_TOKEN is missing' }));
  }

  const clientToken = req.headers['x-proxy-token'];
  if (clientToken !== expectedToken) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Unauthorized: Invalid proxy token' }));
  }

  const qs = new URL(req.url, `http://localhost`).searchParams;
  const target = qs.get('url');

  if (!target) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'url param required' }));
  }

  fetchUrl(target, req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`fetch-proxy listening on port ${PORT}`);
});

