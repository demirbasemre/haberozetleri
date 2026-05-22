const url = "https://api.stlouisfed.org/fred/series/observations?series_id=WJFUELUSGULF&api_key=ba29f7b58bfc036bddf0434ceb0c0534&file_type=json&limit=5&sort_order=desc&observation_start=2025-01-01";
const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
fetch(proxyUrl).then(r => r.json()).then(d => console.log(d.observations.slice(0,2))).catch(e => console.error(e));
