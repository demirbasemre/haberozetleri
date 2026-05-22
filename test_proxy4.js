const url = "https://api.stlouisfed.org/fred/series/observations?series_id=WJFUELUSGULF&api_key=ba29f7b58bfc036bddf0434ceb0c0534&file_type=json&limit=2&sort_order=desc&cb=1";
fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url))
  .then(r => r.json())
  .then(d => console.log("allorigins/raw:", d.observations.length))
  .catch(e => console.error("allorigins/raw:", e));
