const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = 3100;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function fetchUrl(targetUrl, res) {
  let parsed;
  try { parsed = new URL(targetUrl); } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'invalid url' }));
  }

  const lib = parsed.protocol === 'https:' ? https : http;
  const req = lib.request(parsed, { headers: HEADERS }, upstream => {
    // Follow redirects (up to 5)
    if ([301, 302, 303, 307, 308].includes(upstream.statusCode) && upstream.headers.location) {
      return fetchUrl(upstream.headers.location, res);
    }
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
  req.end();
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET' });
    return res.end();
  }

  const qs = new URL(req.url, `http://localhost`).searchParams;
  const target = qs.get('url');

  if (!target) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'url param required' }));
  }

  fetchUrl(target, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`fetch-proxy listening on port ${PORT}`);
});
