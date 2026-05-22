const url = "https://api.stlouisfed.org/fred/series/observations?series_id=WJFUELUSGULF&api_key=ba29f7b58bfc036bddf0434ceb0c0534&file_type=json&limit=2&sort_order=desc";
fetch('https://corsproxy.io/?' + encodeURIComponent(url))
  .then(r => r.json())
  .then(d => console.log("corsproxy.io:", d.observations.length))
  .catch(e => console.error("corsproxy.io:", e));

fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url))
  .then(r => r.json())
  .then(d => console.log("codetabs:", d.observations.length))
  .catch(e => console.error("codetabs:", e));
