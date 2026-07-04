export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (method === 'GET' && path === '/api/get-fleet') {
      const data = await env.FLEET_DATA_KV.get('fleet_latest');
      return new Response(data || '{"airlines":[]}', { headers: corsHeaders });
    }

    if (method === 'GET' && path === '/api/get-aircrafts') {
      const data = await env.FLEET_DATA_KV.get('aircraft_list');
      return new Response(data || '[]', { headers: corsHeaders });
    }

    if (method === 'GET' && path === '/api/get-aircrafts-meta') {
      const data = await env.FLEET_DATA_KV.get('aircraft_list_meta');
      return new Response(data || '{}', { headers: corsHeaders });
    }

    if (method === 'GET' && path === '/api/get-history-index') {
      const data = await env.FLEET_DATA_KV.get('history_index');
      return new Response(data || '[]', { headers: corsHeaders });
    }

    if (method === 'GET' && path === '/api/get-history') {
      const date = url.searchParams.get('date');
      if (!date) {
        return new Response(JSON.stringify({ error: 'Date is required' }), { status: 400, headers: corsHeaders });
      }
      const data = await env.FLEET_DATA_KV.get('history_' + date);
      return new Response(data || '{}', { headers: corsHeaders });
    }

    if (method === 'POST' && path === '/api/save-fleet') {
      try {
        const body = await request.json();
        const pwd = body.password;

        // Şifre yalnızca Worker secret'ından okunur (FLEET_PASSWORD)
        if (!env.FLEET_PASSWORD || pwd !== env.FLEET_PASSWORD) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }

        const fleetData = body.fleet;
        const dateStr = body.date;

        if (!fleetData) {
          return new Response(JSON.stringify({ error: 'Fleet data is required' }), { status: 400, headers: corsHeaders });
        }

        await env.FLEET_DATA_KV.put('fleet_latest', JSON.stringify(fleetData));

        if (dateStr) {
          const indexRaw = await env.FLEET_DATA_KV.get('history_index');
          let index = [];
          if (indexRaw) {
            try { index = JSON.parse(indexRaw); } catch(e) {}
          }
          if (!index.includes(dateStr)) {
            index.push(dateStr);
            index.sort();
            await env.FLEET_DATA_KV.put('history_index', JSON.stringify(index));
          }

          await env.FLEET_DATA_KV.put('history_' + dateStr, JSON.stringify(fleetData));
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } catch(e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (method === 'POST' && path === '/api/save-aircrafts') {
      try {
        const body = await request.json();

        if (!env.FLEET_PASSWORD || body.password !== env.FLEET_PASSWORD) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }
        if (!Array.isArray(body.aircrafts) || body.aircrafts.length === 0) {
          return new Response(JSON.stringify({ error: 'Aircrafts data is required' }), { status: 400, headers: corsHeaders });
        }

        await env.FLEET_DATA_KV.put('aircraft_list', JSON.stringify(body.aircrafts));
        await env.FLEET_DATA_KV.put('aircraft_list_meta', JSON.stringify({
          updatedAt: new Date().toISOString(),
          count: body.aircrafts.length
        }));
        return new Response(JSON.stringify({ success: true, count: body.aircrafts.length }), { headers: corsHeaders });
      } catch(e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ status: 'running', service: 'Cloudflare Fleet API Worker' }), { headers: corsHeaders });
  }
};
