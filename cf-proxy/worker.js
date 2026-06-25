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

const AIRPORT_DB = {
  "LTFM": { icao: "LTFM", iata: "IST", name: "Istanbul Airport", city: "Istanbul", lat: 41.262, lon: 28.727 },
  "IST": { icao: "LTFM", iata: "IST", name: "Istanbul Airport", city: "Istanbul", lat: 41.262, lon: 28.727 },
  "LTBA": { icao: "LTBA", iata: "ISL", name: "Atatürk Airport", city: "Istanbul", lat: 40.976, lon: 28.814 },
  "ISL": { icao: "LTBA", iata: "ISL", name: "Atatürk Airport", city: "Istanbul", lat: 40.976, lon: 28.814 },
  "KJFK": { icao: "KJFK", iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", lat: 40.640, lon: -73.779 },
  "JFK": { icao: "KJFK", iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", lat: 40.640, lon: -73.779 },
  "KORD": { icao: "KORD", iata: "ORD", name: "O'Hare International Airport", city: "Chicago", lat: 41.974, lon: -87.907 },
  "ORD": { icao: "KORD", iata: "ORD", name: "O'Hare International Airport", city: "Chicago", lat: 41.974, lon: -87.907 },
  "EGLL": { icao: "EGLL", iata: "LHR", name: "London Heathrow Airport", city: "London", lat: 51.470, lon: -0.454 },
  "LHR": { icao: "EGLL", iata: "LHR", name: "London Heathrow Airport", city: "London", lat: 51.470, lon: -0.454 },
  "EDDF": { icao: "EDDF", iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", lat: 50.038, lon: 8.562 },
  "FRA": { icao: "EDDF", iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", lat: 50.038, lon: 8.562 },
  "LFPG": { icao: "LFPG", iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", lat: 49.009, lon: 2.547 },
  "CDG": { icao: "LFPG", iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", lat: 49.009, lon: 2.547 },
  "EHAM": { icao: "EHAM", iata: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", lat: 52.308, lon: 4.768 },
  "AMS": { icao: "EHAM", iata: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", lat: 52.308, lon: 4.768 },
  "LIMC": { icao: "LIMC", iata: "MXP", name: "Malpensa Airport", city: "Milan", lat: 45.630, lon: 8.723 },
  "MXP": { icao: "LIMC", iata: "MXP", name: "Malpensa Airport", city: "Milan", lat: 45.630, lon: 8.723 },
  "ESSA": { icao: "ESSA", iata: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", lat: 59.651, lon: 17.918 },
  "ARN": { icao: "ESSA", iata: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", lat: 59.651, lon: 17.918 },
  "OMDB": { icao: "OMDB", iata: "DXB", name: "Dubai International Airport", city: "Dubai", lat: 25.253, lon: 55.364 },
  "DXB": { icao: "OMDB", iata: "DXB", name: "Dubai International Airport", city: "Dubai", lat: 25.253, lon: 55.364 },
  "OMDW": { icao: "OMDW", iata: "DWC", name: "Al Maktoum International Airport", city: "Dubai", lat: 24.897, lon: 55.161 },
  "DWC": { icao: "OMDW", iata: "DWC", name: "Al Maktoum International Airport", city: "Dubai", lat: 24.897, lon: 55.161 },
  "RJAA": { icao: "RJAA", iata: "NRT", name: "Narita International Airport", city: "Tokyo", lat: 35.776, lon: 140.386 },
  "NRT": { icao: "RJAA", iata: "NRT", name: "Narita International Airport", city: "Tokyo", lat: 35.776, lon: 140.386 },
  "ZSPD": { icao: "ZSPD", iata: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", lat: 31.143, lon: 121.805 },
  "PVG": { icao: "ZSPD", iata: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", lat: 31.143, lon: 121.805 },
  "VHHH": { icao: "VHHH", iata: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", lat: 22.308, lon: 113.918 },
  "HKG": { icao: "VHHH", iata: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", lat: 22.308, lon: 113.918 },
  "VVTS": { icao: "VVTS", iata: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", lat: 10.819, lon: 106.652 },
  "SGN": { icao: "VVTS", iata: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", lat: 10.819, lon: 106.652 },
  "VVNB": { icao: "VVNB", iata: "HAN", name: "Noi Bai International Airport", city: "Hanoi", lat: 21.221, lon: 105.807 },
  "HAN": { icao: "VVNB", iata: "HAN", name: "Noi Bai International Airport", city: "Hanoi", lat: 21.221, lon: 105.807 },
  "VIDP": { icao: "VIDP", iata: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", lat: 28.566, lon: 77.103 },
  "DEL": { icao: "VIDP", iata: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", lat: 28.566, lon: 77.103 },
  "VABB": { icao: "VABB", iata: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", lat: 19.088, lon: 72.868 },
  "BOM": { icao: "VABB", iata: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", lat: 19.088, lon: 72.868 },
  "WSSS": { icao: "WSSS", iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", lat: 1.350, lon: 103.994 },
  "SIN": { icao: "WSSS", iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", lat: 1.350, lon: 103.994 },
  "RKSI": { icao: "RKSI", iata: "ICN", name: "Incheon International Airport", city: "Seoul", lat: 37.469, lon: 126.451 },
  "ICN": { icao: "RKSI", iata: "ICN", name: "Incheon International Airport", city: "Seoul", lat: 37.469, lon: 126.451 },
  "ZGGG": { icao: "ZGGG", iata: "CAN", name: "Guangzhou Baiyun International Airport", city: "Guangzhou", lat: 23.392, lon: 113.299 },
  "CAN": { icao: "ZGGG", iata: "CAN", name: "Guangzhou Baiyun International Airport", city: "Guangzhou", lat: 23.392, lon: 113.299 },
  "ZGSZ": { icao: "ZGSZ", iata: "SZX", name: "Shenzhen Bao'an International Airport", city: "Shenzhen", lat: 22.639, lon: 113.811 },
  "SZX": { icao: "ZGSZ", iata: "SZX", name: "Shenzhen Bao'an International Airport", city: "Shenzhen", lat: 22.639, lon: 113.811 },
  "ZHCC": { icao: "ZHCC", iata: "CGO", name: "Zhengzhou Xinzheng International Airport", city: "Zhengzhou", lat: 34.520, lon: 113.841 },
  "CGO": { icao: "ZHCC", iata: "CGO", name: "Zhengzhou Xinzheng International Airport", city: "Zhengzhou", lat: 34.520, lon: 113.841 },
  "ZWWW": { icao: "ZWWW", iata: "URC", name: "Diwopu International Airport", city: "Urumqi", lat: 43.907, lon: 87.474 },
  "URC": { icao: "ZWWW", iata: "URC", name: "Diwopu International Airport", city: "Urumqi", lat: 43.907, lon: 87.474 },
  "UAAA": { icao: "UAAA", iata: "ALA", name: "Almaty International Airport", city: "Almaty", lat: 43.352, lon: 77.041 },
  "ALA": { icao: "UAAA", iata: "ALA", name: "Almaty International Airport", city: "Almaty", lat: 43.352, lon: 77.041 },
  "UTTT": { icao: "UTTT", iata: "TAS", name: "Tashkent International Airport", city: "Tashkent", lat: 41.258, lon: 69.282 },
  "TAS": { icao: "UTTT", iata: "TAS", name: "Tashkent International Airport", city: "Tashkent", lat: 41.258, lon: 69.282 },
  "UBBB": { icao: "UBBB", iata: "GYD", name: "Heydar Aliyev International Airport", city: "Baku", lat: 40.467, lon: 50.047 },
  "GYD": { icao: "UBBB", iata: "GYD", name: "Heydar Aliyev International Airport", city: "Baku", lat: 40.467, lon: 50.047 },
  "OOMS": { icao: "OOMS", iata: "MCT", name: "Muscat International Airport", city: "Muscat", lat: 23.593, lon: 58.284 },
  "MCT": { icao: "OOMS", iata: "MCT", name: "Muscat International Airport", city: "Muscat", lat: 23.593, lon: 58.284 },
  "OTHH": { icao: "OTHH", iata: "DOH", name: "Hamad International Airport", city: "Doha", lat: 25.273, lon: 51.608 },
  "DOH": { icao: "OTHH", iata: "DOH", name: "Hamad International Airport", city: "Doha", lat: 25.273, lon: 51.608 },
  "OERK": { icao: "OERK", iata: "RUH", name: "King Khalid International Airport", city: "Riyadh", lat: 24.957, lon: 46.699 },
  "RUH": { icao: "OERK", iata: "RUH", name: "King Khalid International Airport", city: "Riyadh", lat: 24.957, lon: 46.699 },
  "OEJN": { icao: "OEJN", iata: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", lat: 21.680, lon: 39.157 },
  "JED": { icao: "OEJN", iata: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", lat: 21.680, lon: 39.157 },
  "OKBK": { icao: "OKBK", iata: "KWI", name: "Kuwait International Airport", city: "Kuwait", lat: 29.227, lon: 47.969 },
  "KWI": { icao: "OKBK", iata: "KWI", name: "Kuwait International Airport", city: "Kuwait", lat: 29.227, lon: 47.969 },
  "OBBI": { icao: "OBBI", iata: "BAH", name: "Bahrain International Airport", city: "Bahrain", lat: 26.271, lon: 50.633 },
  "BAH": { icao: "OBBI", iata: "BAH", name: "Bahrain International Airport", city: "Bahrain", lat: 26.271, lon: 50.633 },
  "ORER": { icao: "ORER", iata: "EBL", name: "Erbil International Airport", city: "Erbil", lat: 36.238, lon: 43.963 },
  "EBL": { icao: "ORER", iata: "EBL", name: "Erbil International Airport", city: "Erbil", lat: 36.238, lon: 43.963 },
  "ORBI": { icao: "ORBI", iata: "BGW", name: "Baghdad International Airport", city: "Baghdad", lat: 33.262, lon: 44.235 },
  "BGW": { icao: "ORBI", iata: "BGW", name: "Baghdad International Airport", city: "Baghdad", lat: 33.262, lon: 44.235 },
  "HECA": { icao: "HECA", iata: "CAI", name: "Cairo International Airport", city: "Cairo", lat: 30.122, lon: 31.406 },
  "CAI": { icao: "HECA", iata: "CAI", name: "Cairo International Airport", city: "Cairo", lat: 30.122, lon: 31.406 },
  "DNMM": { icao: "DNMM", iata: "LOS", name: "Murtala Muhammed International Airport", city: "Lagos", lat: 6.577, lon: 3.321 },
  "LOS": { icao: "DNMM", iata: "LOS", name: "Murtala Muhammed International Airport", city: "Lagos", lat: 6.577, lon: 3.321 },
  "HKJK": { icao: "HKJK", iata: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", lat: -1.319, lon: 36.928 },
  "NBO": { icao: "HKJK", iata: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", lat: -1.319, lon: 36.928 },
  "GOBD": { icao: "GOBD", iata: "DSS", name: "Blaise Diagne International Airport", city: "Dakar", lat: 14.740, lon: -17.490 },
  "DSS": { icao: "GOBD", iata: "DSS", name: "Blaise Diagne International Airport", city: "Dakar", lat: 14.740, lon: -17.490 },
  "DTTA": { icao: "DTTA", iata: "TUN", name: "Tunis-Carthage International Airport", city: "Tunis", lat: 36.851, lon: 10.227 },
  "TUN": { icao: "DTTA", iata: "TUN", name: "Tunis-Carthage International Airport", city: "Tunis", lat: 36.851, lon: 10.227 },
  "DAAG": { icao: "DAAG", iata: "ALG", name: "Houari Boumediene Airport", city: "Algiers", lat: 36.691, lon: 3.215 },
  "ALG": { icao: "DAAG", iata: "ALG", name: "Houari Boumediene Airport", city: "Algiers", lat: 36.691, lon: 3.215 },
  "GMMN": { icao: "GMMN", iata: "CMN", name: "Mohammed V International Airport", city: "Casablanca", lat: 33.367, lon: -7.590 },
  "CMN": { icao: "GMMN", iata: "CMN", name: "Mohammed V International Airport", city: "Casablanca", lat: 33.367, lon: -7.590 },
  "FAOR": { icao: "FAOR", iata: "JNB", name: "O. R. Tambo International Airport", city: "Johannesburg", lat: -26.139, lon: 28.246 },
  "JNB": { icao: "FAOR", iata: "JNB", name: "O. R. Tambo International Airport", city: "Johannesburg", lat: -26.139, lon: 28.246 },
  "KMIA": { icao: "KMIA", iata: "MIA", name: "Miami International Airport", city: "Miami", lat: 25.795, lon: -80.290 },
  "MIA": { icao: "KMIA", iata: "MIA", name: "Miami International Airport", city: "Miami", lat: 25.795, lon: -80.290 },
  "KIAD": { icao: "KIAD", iata: "IAD", name: "Washington Dulles International Airport", city: "Washington", lat: 38.948, lon: -77.456 },
  "IAD": { icao: "KIAD", iata: "IAD", name: "Washington Dulles International Airport", city: "Washington", lat: 38.948, lon: -77.456 },
  "KATL": { icao: "KATL", iata: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", lat: 33.640, lon: -84.427 },
  "ATL": { icao: "KATL", iata: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", lat: 33.640, lon: -84.427 },
  "CYYZ": { icao: "CYYZ", iata: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", lat: 43.677, lon: -79.624 },
  "YYZ": { icao: "CYYZ", iata: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", lat: 43.677, lon: -79.624 },
  "SBGR": { icao: "SBGR", iata: "GRU", name: "Guarulhos International Airport", city: "São Paulo", lat: -23.435, lon: -46.473 },
  "GRU": { icao: "SBGR", iata: "GRU", name: "Guarulhos International Airport", city: "São Paulo", lat: -23.435, lon: -46.473 },
  "MMMX": { icao: "MMMX", iata: "MEX", name: "Mexico City International Airport", city: "Mexico City", lat: 19.436, lon: -99.072 },
  "MEX": { icao: "MMMX", iata: "MEX", name: "Mexico City International Airport", city: "Mexico City", lat: 19.436, lon: -99.072 },
  "HLLM": { icao: "HLLM", iata: "MJI", name: "Mitiga International Airport", city: "Tripoli", lat: 32.901, lon: 13.279 },
  "MJI": { icao: "HLLM", iata: "MJI", name: "Mitiga International Airport", city: "Tripoli", lat: 32.901, lon: 13.279 },
  "LEMD": { icao: "LEMD", iata: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", lat: 40.472, lon: -3.563 },
  "MAD": { icao: "LEMD", iata: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", lat: 40.472, lon: -3.563 },
  "EBLG": { icao: "EBLG", iata: "LGG", name: "Liège Airport", city: "Liège", lat: 50.637, lon: 5.443 },
  "LGG": { icao: "EBLG", iata: "LGG", name: "Liège Airport", city: "Liège", lat: 50.637, lon: 5.443 },
  "KCMH": { icao: "KCMH", iata: "CMH", name: "John Glenn Columbus International Airport", city: "Columbus", lat: 39.998, lon: -82.892 },
  "CMH": { icao: "KCMH", iata: "CMH", name: "John Glenn Columbus International Airport", city: "Columbus", lat: 39.998, lon: -82.892 },
  "VOMM": { icao: "VOMM", iata: "MAA", name: "Chennai International Airport", city: "Chennai", lat: 12.994, lon: 80.181 },
  "MAA": { icao: "VOMM", iata: "MAA", name: "Chennai International Airport", city: "Chennai", lat: 12.994, lon: 80.181 }
};

const CARGO_STATIC_ROUTES = {
  "THY6116": [
    { dep: "HLLM", arr: "HECA" }, // Tripoli (Mitiga) -> Cairo
    { dep: "LEMD", arr: "LTFM" }  // Madrid -> Istanbul
  ],
  "THY6058": [
    { dep: "GOBD", arr: "LTFM" }  // Dakar -> Istanbul
  ],
  "THY6112": [
    { dep: "LTFM", arr: "VABB" }  // Istanbul -> Mumbai
  ],
  "THY6421": [
    { dep: "LTFM", arr: "LFPG" }  // Istanbul -> Paris
  ],
  "THY6091": [
    { dep: "LTFM", arr: "EBLG" }  // Istanbul -> Liège
  ],
  "THY6118": [
    { dep: "LTFM", arr: "VOMM" }  // Istanbul -> Chennai (MAA)
  ]
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
        const cs = urlObj.searchParams.get('callsign') || 'THY6354';
        const adsbRes = await doFetch(`https://api.adsbdb.com/v0/callsign/${cs}`, {}, false, 0);
        let parsed = null, parseError = null;
        try { parsed = JSON.parse(adsbRes.body); } catch (e) { parseError = e.message; }
        return new Response(JSON.stringify({
          callsign: cs,
          adsbStatus: adsbRes.status,
          adsbProxy: adsbRes.proxy,
          bodySnippet: adsbRes.body.slice(0, 400),
          parsed,
          parseError,
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // ── /cargo-flights Canlı THY Kargo Uçakları Rotası ──
    if (urlObj.pathname === '/cargo-flights') {
      const forceDirect = urlObj.searchParams.get('direct') === '1';
      const cacheKey = new Request('https://internal.cache/cargo-flights-v1');
      const kvKey = 'cargo_flights_cache_v1';

      async function getCachedFlights() {
        if (env.FBX_ROUTES_KV) {
          try {
            const data = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' });
            if (data) return data;
          } catch (_) {}
        }
        try {
          const cached = await caches.default.match(cacheKey);
          if (cached) return await cached.json();
        } catch (_) {}
        return null;
      }

      async function setCachedFlights(publicData) {
        if (env.FBX_ROUTES_KV) {
          try {
            await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(publicData), { expirationTtl: 120 });
          } catch (_) {}
        }
        try {
          await caches.default.put(cacheKey, new Response(JSON.stringify(publicData), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=70' },
          }));
        } catch (_) {}
      }

      async function computeBaseCargoFlights() {
        const token = await getOpenSkyToken(env, doFetch);
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
        const statesRes = await doFetch('https://opensky-network.org/api/states/all', { headers: authHeaders }, forceDirect, 50);
        if (statesRes.status !== 200) {
          throw new Error(`OpenSky states fetch failed (status ${statesRes.status})`);
        }
        const statesData = JSON.parse(statesRes.body);
        const states = statesData.states || [];

        const allFlights = [];
        for (const s of states) {
          const callsign = (s[1] || '').trim();
          if (!callsign.startsWith('THY')) continue;
          const flightNumMatch = callsign.match(/^THY(\d+)/);
          if (!flightNumMatch) continue;
          const flightNum = parseInt(flightNumMatch[1], 10);
          const [icao24, , origin_country, , last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, , geo_altitude, squawk] = s;
          if (on_ground || latitude == null || longitude == null) continue;
          allFlights.push({
            icao24, callsign, lat: latitude, lon: longitude,
            altitude: baro_altitude, geoAltitude: geo_altitude, velocity, track: true_track,
            verticalRate: vertical_rate, squawk: squawk || null, originCountry: origin_country || null,
            lastContact: last_contact,
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

      function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      }

      function cleanCityName(city, icaoCode, iataCode) {
        if (!city) return 'Bilinmiyor';
        const uIcao = icaoCode ? icaoCode.toUpperCase() : null;
        const uIata = iataCode ? iataCode.toUpperCase() : null;
        const localDb = (uIcao && AIRPORT_DB[uIcao]) || (uIata && AIRPORT_DB[uIata]);
        if (localDb && localDb.city) {
          return localDb.city;
        }
        if (city.includes(',')) {
          const parts = city.split(',');
          return parts[parts.length - 1].trim();
        }
        return city;
      }

      function cleanRouteCities(route) {
        if (!route) return null;
        if (route.dep) {
          route.dep.city = cleanCityName(route.dep.city, route.dep.icao, route.dep.iata);
        }
        if (route.arr) {
          route.arr.city = cleanCityName(route.arr.city, route.arr.icao, route.arr.iata);
        }
        return route;
      }

      async function getLearnedRoute(callsign, lat, lon) {
        if (!env.FBX_ROUTES_KV) return null;
        const uppercaseCallsign = callsign.toUpperCase();
        const kvKey = `learned_routes_${uppercaseCallsign}`;
        try {
          let routes = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' }) || [];
          if (uppercaseCallsign === 'THY6058') {
            const filtered = routes.filter(r => r.dep && r.dep.icao === 'GOBD');
            if (filtered.length !== routes.length) {
              routes = filtered;
              await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(routes));
            }
          }
          for (const r of routes) {
            if (r.dep && r.dep.lat != null && r.arr && r.arr.lat != null) {
              const dDep = getDistance(lat, lon, r.dep.lat, r.dep.lon);
              const dArr = getDistance(lat, lon, r.arr.lat, r.arr.lon);
              const dTotal = getDistance(r.dep.lat, r.dep.lon, r.arr.lat, r.arr.lon);
              const maxAllowed = Math.max(dTotal * 1.20, dTotal + 400);
              if (dDep + dArr <= maxAllowed) {
                return cleanRouteCities(r); // Rota eşleşti ve şehirler temizlendi!
              }
            }
          }
        } catch (_) {}
        return null;
      }

      async function saveLearnedRoute(callsign, route) {
        if (!env.FBX_ROUTES_KV || !route || !route.dep || !route.arr) return;
        const kvKey = `learned_routes_${callsign}`;
        try {
          const routes = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' }) || [];
          const exists = routes.some(r => r.dep.icao === route.dep.icao && r.arr.icao === route.arr.icao);
          if (!exists) {
            routes.push(route);
            if (routes.length > 5) routes.shift(); // En son 5 rotayı tut
            await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(routes));
          }
        } catch (_) {}
      }

      async function fetchAircraftDetailsFromAdsbdb(icao24) {
        const uppercaseIcao = icao24.toUpperCase();
        const kvKey = `aircraft_details_${uppercaseIcao}`;
        if (env.FBX_ROUTES_KV) {
          try {
            const cached = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' });
            if (cached) return cached;
          } catch (_) {}
        }
        
        const res = await doFetch(`https://api.adsbdb.com/v0/aircraft/${uppercaseIcao}`, {}, false, 86400);
        if (res.status !== 200) return null;
        let data;
        try { data = JSON.parse(res.body); } catch { return null; }
        const ac = data?.response?.aircraft;
        if (!ac) return null;
        
        const details = {
          registration: ac.registration || null,
          type: ac.type || null,
          icaoType: ac.icao_type || null,
          manufacturer: ac.manufacturer || null,
          photoUrl: ac.url_photo || null,
          photoThumb: ac.url_photo_thumbnail || null,
        };
        
        if (env.FBX_ROUTES_KV && details.registration) {
          try {
            await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(details));
          } catch (_) {}
        }
        return details;
      }

      async function fetchRouteFromAdsbdb(callsign) {
        const res = await doFetch(`https://api.adsbdb.com/v0/callsign/${callsign}`, {}, false, 21600);
        if (res.status !== 200) return null;
        let data;
        try { data = JSON.parse(res.body); } catch { return null; }
        const route = data?.response?.flightroute;
        if (!route) return null;
        const toAirport = (a) => {
          if (!a) return null;
          const icao = a.icao_code ? a.icao_code.toUpperCase() : null;
          const iata = a.iata_code ? a.iata_code.toUpperCase() : null;
          const localDb = (icao && AIRPORT_DB[icao]) || (iata && AIRPORT_DB[iata]);
          
          let city = a.municipality || a.city || '';
          if (localDb && localDb.city) {
            city = localDb.city;
          } else if (city.includes(',')) {
            const parts = city.split(',');
            city = parts[parts.length - 1].trim();
          }
          
          return {
            icao: a.icao_code || (localDb ? localDb.icao : null),
            iata: a.iata_code || (localDb ? localDb.iata : null),
            name: a.name || (localDb ? localDb.name : null),
            city: city || 'Bilinmiyor',
            lat: a.latitude || (localDb ? localDb.lat : null),
            lon: a.longitude || (localDb ? localDb.lon : null),
          };
        };
        return { dep: toAirport(route.origin), arr: toAirport(route.destination) };
      }

      const parseAeroAPIAirport = (a) => {
        if (!a) return null;
        const icao = a.code_icao || a.code || null;
        const iata = a.code_iata || null;
        const name = a.name || null;
        let city = a.city || null;
        if (city && city.includes(',')) {
          const parts = city.split(',');
          city = parts[parts.length - 1].trim();
        }
        
        const localDb = (icao && AIRPORT_DB[icao.toUpperCase()]) || (iata && AIRPORT_DB[iata.toUpperCase()]);
        if (localDb) {
          return {
            icao: icao || localDb.icao,
            iata: iata || localDb.iata,
            name: name || localDb.name,
            city: localDb.city || city,
            lat: localDb.lat,
            lon: localDb.lon
          };
        }
        
        return { icao, iata, name, city, lat: null, lon: null };
      };

      const fetchAirportCoordsFromAeroAPI = async (icao) => {
        if (!icao || !env.AEROAPI_KEY) return null;
        const kvKey = `aeroapi_airport_${icao.toUpperCase()}`;
        if (env.FBX_ROUTES_KV) {
          try {
            const cached = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' });
            if (cached) return cached;
          } catch (_) {}
        }
        
        const res = await doFetch(`https://aeroapi.flightaware.com/aeroapi/airports/${icao.toUpperCase()}`, {
          headers: { 'x-apikey': env.AEROAPI_KEY }
        }, true, 604800);
        
        if (res.status !== 200) return null;
        let data;
        try { data = JSON.parse(res.body); } catch { return null; }
        
        const lat = data?.latitude || null;
        const lon = data?.longitude || null;
        const details = { lat, lon };
        
        if (env.FBX_ROUTES_KV && lat !== null) {
          try {
            await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(details));
          } catch (_) {}
        }
        return details;
      };

      const fetchRouteFromAeroAPI = async (callsign) => {
        if (!env.AEROAPI_KEY) return null;
        const uppercaseCallsign = callsign.trim().toUpperCase();
        
        const res = await doFetch(`https://aeroapi.flightaware.com/aeroapi/flights/${uppercaseCallsign}`, {
          headers: { 'x-apikey': env.AEROAPI_KEY }
        }, true, 21600);
        
        if (res.status !== 200) return null;
        let data;
        try { data = JSON.parse(res.body); } catch { return null; }
        
        const flightsList = data?.flights;
        if (!Array.isArray(flightsList) || flightsList.length === 0) return null;
        
        const flight = flightsList[0];
        if (!flight || !flight.origin || !flight.destination) return null;
        
        const dep = parseAeroAPIAirport(flight.origin);
        const arr = parseAeroAPIAirport(flight.destination);
        
        if (dep && (dep.lat === null || dep.lon === null) && dep.icao) {
          const coords = await fetchAirportCoordsFromAeroAPI(dep.icao);
          if (coords) {
            dep.lat = coords.lat;
            dep.lon = coords.lon;
          }
        }
        if (arr && (arr.lat === null || arr.lon === null) && arr.icao) {
          const coords = await fetchAirportCoordsFromAeroAPI(arr.icao);
          if (coords) {
            arr.lat = coords.lat;
            arr.lon = coords.lon;
          }
        }
        
        return { dep, arr };
      };

      async function enrichInBackground(data, cachedFlights) {
        const { flights } = data;
        const cargoFlights = flights.filter(f => f.type === 'cargo');
        let cacheUpdated = false;
        
        for (const f of cargoFlights) {
          // 1. Rota tespiti (Hafızadan/API'den teyitli)
          if (!f.dep) {
            // Önce kendi KV'mizden öğrenilmiş rotaları kontrol et
            const learnedRoute = await getLearnedRoute(f.callsign, f.lat, f.lon);
            if (learnedRoute) {
              f.dep = learnedRoute.dep;
              f.arr = learnedRoute.arr;
              cacheUpdated = true;
            } else {
              // KV'de yoksa API'den çek ve teyit et
              try {
                let apiRoute = await fetchRouteFromAdsbdb(f.callsign);
                let valid = false;
                if (apiRoute && apiRoute.dep && apiRoute.arr) {
                  const dDep = getDistance(f.lat, f.lon, apiRoute.dep.lat, apiRoute.dep.lon);
                  const dArr = getDistance(f.lat, f.lon, apiRoute.arr.lat, apiRoute.arr.lon);
                  const dTotal = getDistance(apiRoute.dep.lat, apiRoute.dep.lon, apiRoute.arr.lat, apiRoute.arr.lon);
                  const maxAllowed = Math.max(dTotal * 1.20, dTotal + 400);
                  if (dDep + dArr <= maxAllowed) {
                    valid = true;
                  }
                }
                
                // Fallback to static routes list if adsbdb is invalid or missing
                if (!valid) {
                  const candidates = CARGO_STATIC_ROUTES[f.callsign.toUpperCase()];
                  if (candidates) {
                    for (const c of candidates) {
                      const depDb = AIRPORT_DB[c.dep.toUpperCase()];
                      const arrDb = AIRPORT_DB[c.arr.toUpperCase()];
                      if (depDb && arrDb) {
                        const dDep = getDistance(f.lat, f.lon, depDb.lat, depDb.lon);
                        const dArr = getDistance(f.lat, f.lon, arrDb.lat, arrDb.lon);
                        const dTotal = getDistance(depDb.lat, depDb.lon, arrDb.lat, arrDb.lon);
                        const maxAllowed = Math.max(dTotal * 1.20, dTotal + 400);
                        if (dDep + dArr <= maxAllowed) {
                          apiRoute = { dep: depDb, arr: arrDb };
                          valid = true;
                          break;
                        }
                      }
                    }
                  }
                }

                if (!valid && env.AEROAPI_KEY) {
                  const aeroRoute = await fetchRouteFromAeroAPI(f.callsign);
                  if (aeroRoute && aeroRoute.dep && aeroRoute.arr) {
                    const dDep = getDistance(f.lat, f.lon, aeroRoute.dep.lat, aeroRoute.dep.lon);
                    const dArr = getDistance(f.lat, f.lon, aeroRoute.arr.lat, aeroRoute.arr.lon);
                    const dTotal = getDistance(aeroRoute.dep.lat, aeroRoute.dep.lon, aeroRoute.arr.lat, aeroRoute.arr.lon);
                    const maxAllowed = Math.max(dTotal * 1.20, dTotal + 400);
                    if (dDep + dArr <= maxAllowed) {
                      apiRoute = aeroRoute;
                      valid = true;
                    }
                  }
                }

                if (valid && apiRoute && apiRoute.dep && apiRoute.arr) {
                  f.dep = apiRoute.dep;
                  f.arr = apiRoute.arr;
                  cacheUpdated = true;
                  // Başarılıysa KV'ye öğrenilmiş rota olarak kaydet
                  await saveLearnedRoute(f.callsign, apiRoute);
                }
              } catch (_) {}
              await new Promise(r => setTimeout(r, 1200));
            }
          }

          // 2. Uçak detaylarını (Tescil, Model, Fotoğraf) çek
          if (!f.aircraftDetails) {
            try {
              const acDetails = await fetchAircraftDetailsFromAdsbdb(f.icao24);
              if (acDetails) {
                f.aircraftDetails = acDetails;
                cacheUpdated = true;
              }
            } catch (_) {}
            await new Promise(r => setTimeout(r, 1200));
          }
        }
        
        if (cacheUpdated) {
          const { token: _t, authHeaders: _a, ...publicData } = data;
          await setCachedFlights(publicData);
        }
      }

      async function refreshAndCache() {
        const fresh = await computeBaseCargoFlights();
        
        let cachedFlights = [];
        try {
          const cachedData = await getCachedFlights();
          if (cachedData) {
            cachedFlights = cachedData.flights || [];
          }
        } catch (_) {}

        for (const f of fresh.flights) {
          const prev = cachedFlights.find(p => p.callsign === f.callsign);
          if (prev) {
            // E.D. Düzeltme: THY6058 için önbellekteki eski hatalı Columbus (KCMH) rotasını yok say
            if (f.callsign.toUpperCase() === 'THY6058' && prev.dep && prev.dep.icao !== 'GOBD') {
              prev.dep = null;
              prev.arr = null;
            }
            if (prev.dep && prev.dep.lat != null && prev.arr && prev.arr.lat != null) {
              // Verify that the aircraft is still flying along the cached route
              const dDep = getDistance(f.lat, f.lon, prev.dep.lat, prev.dep.lon);
              const dArr = getDistance(f.lat, f.lon, prev.arr.lat, prev.arr.lon);
              const dTotal = getDistance(prev.dep.lat, prev.dep.lon, prev.arr.lat, prev.arr.lon);
              const maxAllowed = Math.max(dTotal * 1.20, dTotal + 400);
              if (dDep + dArr <= maxAllowed) {
                f.dep = prev.dep;
                f.arr = prev.arr;
                cleanRouteCities(f);
              }
            }
            if (prev.aircraftDetails) {
              f.aircraftDetails = prev.aircraftDetails;
            }
          }

          // Quick synchronous KV lookup fallback to prevent blank data on cache misses
          if (!f.dep && env.FBX_ROUTES_KV) {
            const learnedRoute = await getLearnedRoute(f.callsign, f.lat, f.lon);
            if (learnedRoute) {
              f.dep = learnedRoute.dep;
              f.arr = learnedRoute.arr;
            }
          }
          // Quick static routes fallback if KV learned routes were also missing
          if (!f.dep) {
            const candidates = CARGO_STATIC_ROUTES[f.callsign.toUpperCase()];
            if (candidates) {
              for (const c of candidates) {
                const depDb = AIRPORT_DB[c.dep.toUpperCase()];
                const arrDb = AIRPORT_DB[c.arr.toUpperCase()];
                if (depDb && arrDb) {
                  const dDep = getDistance(f.lat, f.lon, depDb.lat, depDb.lon);
                  const dArr = getDistance(f.lat, f.lon, arrDb.lat, arrDb.lon);
                  const dTotal = getDistance(depDb.lat, depDb.lon, arrDb.lat, arrDb.lon);
                  const maxAllowed = Math.max(dTotal * 1.20, dTotal + 400);
                  if (dDep + dArr <= maxAllowed) {
                    f.dep = depDb;
                    f.arr = arrDb;
                    break;
                  }
                }
              }
            }
          }
          if (!f.aircraftDetails && env.FBX_ROUTES_KV) {
            const kvKey = `aircraft_details_${f.icao24.toUpperCase()}`;
            try {
              const cachedDetails = await env.FBX_ROUTES_KV.get(kvKey, { type: 'json' });
              if (cachedDetails) {
                f.aircraftDetails = cachedDetails;
              }
            } catch (_) {}
          }
        }

        const { token: _t, authHeaders: _a, ...publicData } = fresh;
        await setCachedFlights(publicData);
        ctx.waitUntil(enrichInBackground(fresh, cachedFlights).catch(() => {}));
        return publicData;
      }

      try {
        const cachedData = await getCachedFlights();
        let data;
        if (cachedData) {
          data = cachedData;
          const age = Math.floor(Date.now() / 1000) - data.updated;
          if (age > 55) {
            ctx.waitUntil(refreshAndCache().catch(() => {}));
          }
        } else {
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
