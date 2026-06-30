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
  "MAA": { icao: "VOMM", iata: "MAA", name: "Chennai International Airport", city: "Chennai", lat: 12.994, lon: 80.181 },
  "RCTP": { icao: "RCTP", iata: "TPE", name: "Taiwan Taoyuan International Airport", city: "Taipei", lat: 25.080, lon: 121.234 },
  "TPE": { icao: "RCTP", iata: "TPE", name: "Taiwan Taoyuan International Airport", city: "Taipei", lat: 25.080, lon: 121.234 },
  "LFSB": { icao: "LFSB", iata: "BSL", name: "EuroAirport Basel Mulhouse Freiburg", city: "Basel", lat: 47.590, lon: 7.529 },
  "BSL": { icao: "LFSB", iata: "BSL", name: "EuroAirport Basel Mulhouse Freiburg", city: "Basel", lat: 47.590, lon: 7.529 },
  "UAII": { icao: "UAII", iata: "CIT", name: "Shymkent International Airport", city: "Shymkent", lat: 42.364, lon: 69.479 },
  "CIT": { icao: "UAII", iata: "CIT", name: "Shymkent International Airport", city: "Shymkent", lat: 42.364, lon: 69.479 },
  "DIAP": { icao: "DIAP", iata: "ABJ", name: "Port Bouet Airport", city: "Abidjan", lat: 5.261, lon: -3.926 },
  "ABJ": { icao: "DIAP", iata: "ABJ", name: "Port Bouet Airport", city: "Abidjan", lat: 5.261, lon: -3.926 },
  "DNAA": { icao: "DNAA", iata: "ABV", name: "Nnamdi Azikiwe International Airport", city: "Abuja", lat: 9.007, lon: 7.263 },
  "ABV": { icao: "DNAA", iata: "ABV", name: "Nnamdi Azikiwe International Airport", city: "Abuja", lat: 9.007, lon: 7.263 },
  "LTBJ": { icao: "LTBJ", iata: "ADB", name: "Adnan Menderes International Airport", city: "Izmir", lat: 38.292, lon: 27.157 },
  "ADB": { icao: "LTBJ", iata: "ADB", name: "Adnan Menderes International Airport", city: "Izmir", lat: 38.292, lon: 27.157 },
  "HAAB": { icao: "HAAB", iata: "ADD", name: "Bole International Airport", city: "Addis Ababa", lat: 8.978, lon: 38.799 },
  "ADD": { icao: "HAAB", iata: "ADD", name: "Bole International Airport", city: "Addis Ababa", lat: 8.978, lon: 38.799 },
  "LEMG": { icao: "LEMG", iata: "AGP", name: "Malaga Airport", city: "Malaga", lat: 36.675, lon: -4.499 },
  "AGP": { icao: "LEMG", iata: "AGP", name: "Malaga Airport", city: "Malaga", lat: 36.675, lon: -4.499 },
  "OJAI": { icao: "OJAI", iata: "AMM", name: "Queen Alia International Airport", city: "Amman", lat: 31.723, lon: 35.993 },
  "AMM": { icao: "OJAI", iata: "AMM", name: "Queen Alia International Airport", city: "Amman", lat: 31.723, lon: 35.993 },
  "UTAA": { icao: "UTAA", iata: "ASB", name: "Ashgabat Airport", city: "Ashgabat", lat: 37.987, lon: 58.361 },
  "ASB": { icao: "UTAA", iata: "ASB", name: "Ashgabat Airport", city: "Ashgabat", lat: 37.987, lon: 58.361 },
  "LTAU": { icao: "LTAU", iata: "ASR", name: "Kayseri Erkilet Airport", city: "Kayseri", lat: 38.77, lon: 35.495 },
  "ASR": { icao: "LTAU", iata: "ASR", name: "Kayseri Erkilet Airport", city: "Kayseri", lat: 38.77, lon: 35.495 },
  "LGAV": { icao: "LGAV", iata: "ATH", name: "Eleftherios Venizelos International Airport", city: "Athens", lat: 37.936, lon: 23.944 },
  "ATH": { icao: "LGAV", iata: "ATH", name: "Eleftherios Venizelos International Airport", city: "Athens", lat: 37.936, lon: 23.944 },
  "LTAI": { icao: "LTAI", iata: "AYT", name: "Antalya International Airport", city: "Antalya", lat: 36.899, lon: 30.801 },
  "AYT": { icao: "LTAI", iata: "AYT", name: "Antalya International Airport", city: "Antalya", lat: 36.899, lon: 30.801 },
  "LEBL": { icao: "LEBL", iata: "BCN", name: "Barcelona International Airport", city: "Barcelona", lat: 41.297, lon: 2.078 },
  "BCN": { icao: "LEBL", iata: "BCN", name: "Barcelona International Airport", city: "Barcelona", lat: 41.297, lon: 2.078 },
  "LYBE": { icao: "LYBE", iata: "BEG", name: "Belgrade Nikola Tesla Airport", city: "Belgrad", lat: 44.818, lon: 20.309 },
  "BEG": { icao: "LYBE", iata: "BEG", name: "Belgrade Nikola Tesla Airport", city: "Belgrad", lat: 44.818, lon: 20.309 },
  "EDDB": { icao: "EDDB", iata: "BER", name: "Berlin Brandenburg Airport", city: "Berlin", lat: 52.367, lon: 13.503 },
  "BER": { icao: "EDDB", iata: "BER", name: "Berlin Brandenburg Airport", city: "Berlin", lat: 52.367, lon: 13.503 },
  "OLBA": { icao: "OLBA", iata: "BEY", name: "Beirut Rafic Hariri International Airport", city: "Beirut", lat: 33.821, lon: 35.488 },
  "BEY": { icao: "OLBA", iata: "BEY", name: "Beirut Rafic Hariri International Airport", city: "Beirut", lat: 33.821, lon: 35.488 },
  "GBYD": { icao: "GBYD", iata: "BJL", name: "Banjul International Airport", city: "Banjul", lat: 13.338, lon: -16.652 },
  "BJL": { icao: "GBYD", iata: "BJL", name: "Banjul International Airport", city: "Banjul", lat: 13.338, lon: -16.652 },
  "LTFE": { icao: "LTFE", iata: "BJV", name: "Milas Bodrum International Airport", city: "Bodrum", lat: 37.251, lon: 27.664 },
  "BJV": { icao: "LTFE", iata: "BJV", name: "Milas Bodrum International Airport", city: "Bodrum", lat: 37.251, lon: 27.664 },
  "VTBS": { icao: "VTBS", iata: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", lat: 13.681, lon: 100.747 },
  "BKK": { icao: "VTBS", iata: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", lat: 13.681, lon: 100.747 },
  "GABS": { icao: "GABS", iata: "BKO", name: "Senou Airport", city: "Senou", lat: 12.533, lon: -7.95 },
  "BKO": { icao: "GABS", iata: "BKO", name: "Senou Airport", city: "Senou", lat: 12.533, lon: -7.95 },
  "VOBL": { icao: "VOBL", iata: "BLR", name: "Bengaluru International Airport", city: "Bangalore", lat: 13.198, lon: 77.706 },
  "BLR": { icao: "VOBL", iata: "BLR", name: "Bengaluru International Airport", city: "Bangalore", lat: 13.198, lon: 77.706 },
  "SKBO": { icao: "SKBO", iata: "BOG", name: "El Dorado International Airport", city: "Bogota", lat: 4.702, lon: -74.147 },
  "BOG": { icao: "SKBO", iata: "BOG", name: "El Dorado International Airport", city: "Bogota", lat: 4.702, lon: -74.147 },
  "KBOS": { icao: "KBOS", iata: "BOS", name: "General Edward Lawrence Logan International Airport", city: "Boston", lat: 42.364, lon: -71.005 },
  "BOS": { icao: "KBOS", iata: "BOS", name: "General Edward Lawrence Logan International Airport", city: "Boston", lat: 42.364, lon: -71.005 },
  "EBBR": { icao: "EBBR", iata: "BRU", name: "Brussels Airport", city: "Brussels", lat: 50.901, lon: 4.484 },
  "BRU": { icao: "EBBR", iata: "BRU", name: "Brussels Airport", city: "Brussels", lat: 50.901, lon: 4.484 },
  "UCFM": { icao: "UCFM", iata: "BSZ", name: "Manas International Airport", city: "Bishkek", lat: 43.061, lon: 74.478 },
  "BSZ": { icao: "UCFM", iata: "BSZ", name: "Manas International Airport", city: "Bishkek", lat: 43.061, lon: 74.478 },
  "LHBP": { icao: "LHBP", iata: "BUD", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", lat: 47.437, lon: 19.256 },
  "BUD": { icao: "LHBP", iata: "BUD", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", lat: 47.437, lon: 19.256 },
  "SVMI": { icao: "SVMI", iata: "CCS", name: "Maiquetia (Simon Bolivar Internacional) Airport", city: "Caracas", lat: 10.603, lon: -66.991 },
  "CCS": { icao: "SVMI", iata: "CCS", name: "Maiquetia (Simon Bolivar Internacional) Airport", city: "Caracas", lat: 10.603, lon: -66.991 },
  "WIII": { icao: "WIII", iata: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", lat: -6.126, lon: 106.656 },
  "CGK": { icao: "WIII", iata: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", lat: -6.126, lon: 106.656 },
  "VCBI": { icao: "VCBI", iata: "CMB", name: "Bandaranaike International Colombo Airport", city: "Colombo", lat: 7.181, lon: 79.884 },
  "CMB": { icao: "VCBI", iata: "CMB", name: "Bandaranaike International Colombo Airport", city: "Colombo", lat: 7.181, lon: 79.884 },
  "LTDB": { icao: "LTDB", iata: "COV", name: "Çukurova International Airport", city: "Tarsus", lat: 36.893, lon: 35.072 },
  "COV": { icao: "LTDB", iata: "COV", name: "Çukurova International Airport", city: "Tarsus", lat: 36.893, lon: 35.072 },
  "EKCH": { icao: "EKCH", iata: "CPH", name: "Copenhagen Kastrup Airport", city: "Copenhagen", lat: 55.618, lon: 12.656 },
  "CPH": { icao: "EKCH", iata: "CPH", name: "Copenhagen Kastrup Airport", city: "Copenhagen", lat: 55.618, lon: 12.656 },
  "FACT": { icao: "FACT", iata: "CPT", name: "Cape Town International Airport", city: "Cape Town", lat: -33.965, lon: 18.602 },
  "CPT": { icao: "FACT", iata: "CPT", name: "Cape Town International Airport", city: "Cape Town", lat: -33.965, lon: 18.602 },
  "ZUUU": { icao: "ZUUU", iata: "CTU", name: "Chengdu Shuangliu International Airport", city: "Chengdu", lat: 30.579, lon: 103.947 },
  "CTU": { icao: "ZUUU", iata: "CTU", name: "Chengdu Shuangliu International Airport", city: "Chengdu", lat: 30.579, lon: 103.947 },
  "MMUN": { icao: "MMUN", iata: "CUN", name: "Cancun International Airport", city: "Cancun", lat: 21.037, lon: -86.877 },
  "CUN": { icao: "MMUN", iata: "CUN", name: "Cancun International Airport", city: "Cancun", lat: 21.037, lon: -86.877 },
  "VGHS": { icao: "VGHS", iata: "DAC", name: "Dhaka / Hazrat Shahjalal International Airport", city: "Dhaka", lat: 23.843, lon: 90.398 },
  "DAC": { icao: "VGHS", iata: "DAC", name: "Dhaka / Hazrat Shahjalal International Airport", city: "Dhaka", lat: 23.843, lon: 90.398 },
  "OSDI": { icao: "OSDI", iata: "DAM", name: "Damascus International Airport", city: "Damascus", lat: 33.411, lon: 36.516 },
  "DAM": { icao: "OSDI", iata: "DAM", name: "Damascus International Airport", city: "Damascus", lat: 33.411, lon: 36.516 },
  "KDEN": { icao: "KDEN", iata: "DEN", name: "Denver International Airport", city: "Denver", lat: 39.862, lon: -104.673 },
  "DEN": { icao: "KDEN", iata: "DEN", name: "Denver International Airport", city: "Denver", lat: 39.862, lon: -104.673 },
  "KDFW": { icao: "KDFW", iata: "DFW", name: "Dallas Fort Worth International Airport", city: "Dallas-Fort Worth", lat: 32.897, lon: -97.038 },
  "DFW": { icao: "KDFW", iata: "DFW", name: "Dallas Fort Worth International Airport", city: "Dallas-Fort Worth", lat: 32.897, lon: -97.038 },
  "FKKD": { icao: "FKKD", iata: "DLA", name: "Douala International Airport", city: "Douala", lat: 4.006, lon: 9.719 },
  "DLA": { icao: "FKKD", iata: "DLA", name: "Douala International Airport", city: "Douala", lat: 4.006, lon: 9.719 },
  "LTBS": { icao: "LTBS", iata: "DLM", name: "Dalaman International Airport", city: "Dalaman", lat: 36.713, lon: 28.792 },
  "DLM": { icao: "LTBS", iata: "DLM", name: "Dalaman International Airport", city: "Dalaman", lat: 36.713, lon: 28.792 },
  "WADD": { icao: "WADD", iata: "DPS", name: "Ngurah Rai (Bali) International Airport", city: "Denpasar-Bali Island", lat: -8.748, lon: 115.167 },
  "DPS": { icao: "WADD", iata: "DPS", name: "Ngurah Rai (Bali) International Airport", city: "Denpasar-Bali Island", lat: -8.748, lon: 115.167 },
  "KDTW": { icao: "KDTW", iata: "DTW", name: "Detroit Metropolitan Wayne County Airport", city: "Detroit", lat: 42.212, lon: -83.353 },
  "DTW": { icao: "KDTW", iata: "DTW", name: "Detroit Metropolitan Wayne County Airport", city: "Detroit", lat: 42.212, lon: -83.353 },
  "EIDW": { icao: "EIDW", iata: "DUB", name: "Dublin Airport", city: "Dublin", lat: 53.421, lon: -6.27 },
  "DUB": { icao: "EIDW", iata: "DUB", name: "Dublin Airport", city: "Dublin", lat: 53.421, lon: -6.27 },
  "FALE": { icao: "FALE", iata: "DUR", name: "King Shaka International Airport", city: "Durban", lat: -29.614, lon: 31.12 },
  "DUR": { icao: "FALE", iata: "DUR", name: "King Shaka International Airport", city: "Durban", lat: -29.614, lon: 31.12 },
  "EDDL": { icao: "EDDL", iata: "DUS", name: "Dusseldorf International Airport", city: "Dusseldorf", lat: 51.29, lon: 6.767 },
  "DUS": { icao: "EDDL", iata: "DUS", name: "Dusseldorf International Airport", city: "Dusseldorf", lat: 51.29, lon: 6.767 },
  "HUEN": { icao: "HUEN", iata: "EBB", name: "Entebbe International Airport", city: "Kampala", lat: 0.042, lon: 32.444 },
  "EBB": { icao: "HUEN", iata: "EBB", name: "Entebbe International Airport", city: "Kampala", lat: 0.042, lon: 32.444 },
  "EGPH": { icao: "EGPH", iata: "EDI", name: "Edinburgh Airport", city: "Edinburgh", lat: 55.95, lon: -3.372 },
  "EDI": { icao: "EGPH", iata: "EDI", name: "Edinburgh Airport", city: "Edinburgh", lat: 55.95, lon: -3.372 },
  "LTAC": { icao: "LTAC", iata: "ESB", name: "Esenboga International Airport", city: "Ankara", lat: 40.128, lon: 32.995 },
  "ESB": { icao: "LTAC", iata: "ESB", name: "Esenboga International Airport", city: "Ankara", lat: 40.128, lon: 32.995 },
  "KEWR": { icao: "KEWR", iata: "EWR", name: "Newark Liberty International Airport", city: "Newark", lat: 40.693, lon: -74.169 },
  "EWR": { icao: "KEWR", iata: "EWR", name: "Newark Liberty International Airport", city: "Newark", lat: 40.693, lon: -74.169 },
  "SAEZ": { icao: "SAEZ", iata: "EZE", name: "Ministro Pistarini International Airport", city: "Ezeiza", lat: -34.822, lon: -58.536 },
  "EZE": { icao: "SAEZ", iata: "EZE", name: "Ministro Pistarini International Airport", city: "Ezeiza", lat: -34.822, lon: -58.536 },
  "LIRF": { icao: "LIRF", iata: "FCO", name: "Leonardo Da Vinci (Fiumicino) International Airport", city: "Rome", lat: 41.805, lon: 12.251 },
  "FCO": { icao: "LIRF", iata: "FCO", name: "Leonardo Da Vinci (Fiumicino) International Airport", city: "Rome", lat: 41.805, lon: 12.251 },
  "FZAA": { icao: "FZAA", iata: "FIH", name: "Ndjili International Airport", city: "Kinshasa", lat: -4.386, lon: 15.445 },
  "FIH": { icao: "FZAA", iata: "FIH", name: "Ndjili International Airport", city: "Kinshasa", lat: -4.386, lon: 15.445 },
  "LSGG": { icao: "LSGG", iata: "GVA", name: "Geneva Cointrin International Airport", city: "Geneva", lat: 46.238, lon: 6.109 },
  "GVA": { icao: "LSGG", iata: "GVA", name: "Geneva Cointrin International Airport", city: "Geneva", lat: 46.238, lon: 6.109 },
  "LTAJ": { icao: "LTAJ", iata: "GZT", name: "Gaziantep International Airport", city: "Gaziantep", lat: 36.947, lon: 37.479 },
  "GZT": { icao: "LTAJ", iata: "GZT", name: "Gaziantep International Airport", city: "Gaziantep", lat: 36.947, lon: 37.479 },
  "EFHK": { icao: "EFHK", iata: "HEL", name: "Helsinki Vantaa Airport", city: "Helsinki", lat: 60.317, lon: 24.963 },
  "HEL": { icao: "EFHK", iata: "HEL", name: "Helsinki Vantaa Airport", city: "Helsinki", lat: 60.317, lon: 24.963 },
  "VTSP": { icao: "VTSP", iata: "HKT", name: "Phuket International Airport", city: "Phuket", lat: 8.113, lon: 98.317 },
  "HKT": { icao: "VTSP", iata: "HKT", name: "Phuket International Airport", city: "Phuket", lat: 8.113, lon: 98.317 },
  "RJTT": { icao: "RJTT", iata: "HND", name: "Tokyo International Airport", city: "Tokyo", lat: 35.552, lon: 139.78 },
  "HND": { icao: "RJTT", iata: "HND", name: "Tokyo International Airport", city: "Tokyo", lat: 35.552, lon: 139.78 },
  "VOHS": { icao: "VOHS", iata: "HYD", name: "Rajiv Gandhi International Airport Shamshabad", city: "Hyderabad", lat: 17.231, lon: 78.43 },
  "HYD": { icao: "VOHS", iata: "HYD", name: "Rajiv Gandhi International Airport Shamshabad", city: "Hyderabad", lat: 17.231, lon: 78.43 },
  "KIAH": { icao: "KIAH", iata: "IAH", name: "George Bush Intercontinental Houston Airport", city: "Houston", lat: 29.984, lon: -95.341 },
  "IAH": { icao: "KIAH", iata: "IAH", name: "George Bush Intercontinental Houston Airport", city: "Houston", lat: 29.984, lon: -95.341 },
  "OPIS": { icao: "OPIS", iata: "ISB", name: "Islamabad International Airport", city: "Islamabad", lat: 33.549, lon: 72.826 },
  "ISB": { icao: "OPIS", iata: "ISB", name: "Islamabad International Airport", city: "Islamabad", lat: 33.549, lon: 72.826 },
  "OAKB": { icao: "OAKB", iata: "KBL", name: "Kabul International Airport", city: "Kabul", lat: 34.566, lon: 69.212 },
  "KBL": { icao: "OAKB", iata: "KBL", name: "Kabul International Airport", city: "Kabul", lat: 34.566, lon: 69.212 },
  "HRYR": { icao: "HRYR", iata: "KGL", name: "Kigali International Airport", city: "Kigali", lat: -1.969, lon: 30.139 },
  "KGL": { icao: "HRYR", iata: "KGL", name: "Kigali International Airport", city: "Kigali", lat: -1.969, lon: 30.139 },
  "OPKC": { icao: "OPKC", iata: "KHI", name: "Jinnah International Airport", city: "Karachi", lat: 24.906, lon: 67.161 },
  "KHI": { icao: "OPKC", iata: "KHI", name: "Jinnah International Airport", city: "Karachi", lat: 24.906, lon: 67.161 },
  "RJBB": { icao: "RJBB", iata: "KIX", name: "Kansai International Airport", city: "Osaka", lat: 34.427, lon: 135.244 },
  "KIX": { icao: "RJBB", iata: "KIX", name: "Kansai International Airport", city: "Osaka", lat: 34.427, lon: 135.244 },
  "VDTI": { icao: "VDTI", iata: "KTI", name: "Techo International Airport", city: "Phnom Penh", lat: 11.363, lon: 104.917 },
  "KTI": { icao: "VDTI", iata: "KTI", name: "Techo International Airport", city: "Phnom Penh", lat: 11.363, lon: 104.917 },
  "VNKT": { icao: "VNKT", iata: "KTM", name: "Tribhuvan International Airport", city: "Kathmandu", lat: 27.697, lon: 85.359 },
  "KTM": { icao: "VNKT", iata: "KTM", name: "Tribhuvan International Airport", city: "Kathmandu", lat: 27.697, lon: 85.359 },
  "WMKK": { icao: "WMKK", iata: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", lat: 2.746, lon: 101.71 },
  "KUL": { icao: "WMKK", iata: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", lat: 2.746, lon: 101.71 },
  "UWKD": { icao: "UWKD", iata: "KZN", name: "Kazan International Airport", city: "Kazan", lat: 55.606, lon: 49.279 },
  "KZN": { icao: "UWKD", iata: "KZN", name: "Kazan International Airport", city: "Kazan", lat: 55.606, lon: 49.279 },
  "KLAX": { icao: "KLAX", iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", lat: 33.943, lon: -118.408 },
  "LAX": { icao: "KLAX", iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", lat: 33.943, lon: -118.408 },
  "ULLI": { icao: "ULLI", iata: "LED", name: "Pulkovo Airport", city: "St. Petersburg", lat: 59.8, lon: 30.263 },
  "LED": { icao: "ULLI", iata: "LED", name: "Pulkovo Airport", city: "St. Petersburg", lat: 59.8, lon: 30.263 },
  "OPLA": { icao: "OPLA", iata: "LHE", name: "Alama Iqbal International Airport", city: "Lahore", lat: 31.522, lon: 74.404 },
  "LHE": { icao: "OPLA", iata: "LHE", name: "Alama Iqbal International Airport", city: "Lahore", lat: 31.522, lon: 74.404 },
  "LPPT": { icao: "LPPT", iata: "LIS", name: "Lisbon Portela Airport", city: "Lisbon", lat: 38.781, lon: -9.136 },
  "LIS": { icao: "LPPT", iata: "LIS", name: "Lisbon Portela Airport", city: "Lisbon", lat: 38.781, lon: -9.136 },
  "OEMA": { icao: "OEMA", iata: "MED", name: "Prince Mohammad Bin Abdulaziz Airport", city: "Medina", lat: 24.553, lon: 39.705 },
  "MED": { icao: "OEMA", iata: "MED", name: "Prince Mohammad Bin Abdulaziz Airport", city: "Medina", lat: 24.553, lon: 39.705 },
  "YMML": { icao: "YMML", iata: "MEL", name: "Melbourne International Airport", city: "Melbourne", lat: -37.673, lon: 144.843 },
  "MEL": { icao: "YMML", iata: "MEL", name: "Melbourne International Airport", city: "Melbourne", lat: -37.673, lon: 144.843 },
  "LMML": { icao: "LMML", iata: "MLA", name: "Luqa Airport", city: "Luqa", lat: 35.857, lon: 14.477 },
  "MLA": { icao: "LMML", iata: "MLA", name: "Luqa Airport", city: "Luqa", lat: 35.857, lon: 14.477 },
  "VRMM": { icao: "VRMM", iata: "MLE", name: "Male International Airport", city: "Male", lat: 4.192, lon: 73.529 },
  "MLE": { icao: "VRMM", iata: "MLE", name: "Male International Airport", city: "Male", lat: 4.192, lon: 73.529 },
  "RPLL": { icao: "RPLL", iata: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", lat: 14.509, lon: 121.02 },
  "MNL": { icao: "RPLL", iata: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", lat: 14.509, lon: 121.02 },
  "FQMA": { icao: "FQMA", iata: "MPM", name: "Maputo Airport", city: "Maputo", lat: -25.921, lon: 32.573 },
  "MPM": { icao: "FQMA", iata: "MPM", name: "Maputo Airport", city: "Maputo", lat: -25.921, lon: 32.573 },
  "FIMP": { icao: "FIMP", iata: "MRU", name: "Sir Seewoosagur Ramgoolam International Airport", city: "Port Louis", lat: -20.43, lon: 57.684 },
  "MRU": { icao: "FIMP", iata: "MRU", name: "Sir Seewoosagur Ramgoolam International Airport", city: "Port Louis", lat: -20.43, lon: 57.684 },
  "EHBK": { icao: "EHBK", iata: "MST", name: "Maastricht Aachen Airport", city: "Maastricht", lat: 50.912, lon: 5.77 },
  "MST": { icao: "EHBK", iata: "MST", name: "Maastricht Aachen Airport", city: "Maastricht", lat: 50.912, lon: 5.77 },
  "EDDM": { icao: "EDDM", iata: "MUC", name: "Munich International Airport", city: "Munich", lat: 48.354, lon: 11.786 },
  "MUC": { icao: "EDDM", iata: "MUC", name: "Munich International Airport", city: "Munich", lat: 48.354, lon: 11.786 },
  "LFMN": { icao: "LFMN", iata: "NCE", name: "Nice-Cote d'Azur Airport", city: "Nice", lat: 43.658, lon: 7.216 },
  "NCE": { icao: "LFMN", iata: "NCE", name: "Nice-Cote d'Azur Airport", city: "Nice", lat: 43.658, lon: 7.216 },
  "DRRN": { icao: "DRRN", iata: "NIM", name: "Diori Hamani International Airport", city: "Niamey", lat: 13.481, lon: 2.184 },
  "NIM": { icao: "DRRN", iata: "NIM", name: "Diori Hamani International Airport", city: "Niamey", lat: 13.481, lon: 2.184 },
  "GQNN": { icao: "GQNN", iata: "NKC", name: "Nouakchott International Airport", city: "Nouakchott", lat: 18.098, lon: -15.948 },
  "NKC": { icao: "GQNN", iata: "NKC", name: "Nouakchott International Airport", city: "Nouakchott", lat: 18.098, lon: -15.948 },
  "MMSM": { icao: "MMSM", iata: "NLU", name: "Felipe Angeles International Airport", city: "Santa Lucia", lat: 19.757, lon: -99.015 },
  "NLU": { icao: "MMSM", iata: "NLU", name: "Felipe Angeles International Airport", city: "Santa Lucia", lat: 19.757, lon: -99.015 },
  "UACC": { icao: "UACC", iata: "NQZ", name: "Astana International Airport", city: "Astana", lat: 51.022, lon: 71.467 },
  "NQZ": { icao: "UACC", iata: "NQZ", name: "Astana International Airport", city: "Astana", lat: 51.022, lon: 71.467 },
  "FKYS": { icao: "FKYS", iata: "NSI", name: "Yaounde Nsimalen International Airport", city: "Yaounde", lat: 3.723, lon: 11.553 },
  "NSI": { icao: "FKYS", iata: "NSI", name: "Yaounde Nsimalen International Airport", city: "Yaounde", lat: 3.723, lon: 11.553 },
  "ENGM": { icao: "ENGM", iata: "OSL", name: "Oslo Gardermoen Airport", city: "Oslo", lat: 60.194, lon: 11.1 },
  "OSL": { icao: "ENGM", iata: "OSL", name: "Oslo Gardermoen Airport", city: "Oslo", lat: 60.194, lon: 11.1 },
  "LROP": { icao: "LROP", iata: "OTP", name: "Henri Coanda International Airport", city: "Bucharest", lat: 44.572, lon: 26.102 },
  "OTP": { icao: "LROP", iata: "OTP", name: "Henri Coanda International Airport", city: "Bucharest", lat: 44.572, lon: 26.102 },
  "ZBAA": { icao: "ZBAA", iata: "PEK", name: "Beijing Capital International Airport", city: "Beijing", lat: 40.08, lon: 116.585 },
  "PEK": { icao: "ZBAA", iata: "PEK", name: "Beijing Capital International Airport", city: "Beijing", lat: 40.08, lon: 116.585 },
  "LKPR": { icao: "LKPR", iata: "PRG", name: "Vaclav Havel Airport", city: "Prague", lat: 50.101, lon: 14.26 },
  "PRG": { icao: "LKPR", iata: "PRG", name: "Vaclav Havel Airport", city: "Prague", lat: 50.101, lon: 14.26 },
  "MPTO": { icao: "MPTO", iata: "PTY", name: "Tocumen International Airport", city: "Tocumen", lat: 9.071, lon: -79.383 },
  "PTY": { icao: "MPTO", iata: "PTY", name: "Tocumen International Airport", city: "Tocumen", lat: 9.071, lon: -79.383 },
  "SCEL": { icao: "SCEL", iata: "SCL", name: "Comodoro Arturo Merino Benitez International Airport", city: "Santiago", lat: -33.393, lon: -70.786 },
  "SCL": { icao: "SCEL", iata: "SCL", name: "Comodoro Arturo Merino Benitez International Airport", city: "Santiago", lat: -33.393, lon: -70.786 },
  "KSEA": { icao: "KSEA", iata: "SEA", name: "Seattle Tacoma International Airport", city: "Seattle", lat: 47.449, lon: -122.309 },
  "SEA": { icao: "KSEA", iata: "SEA", name: "Seattle Tacoma International Airport", city: "Seattle", lat: 47.449, lon: -122.309 },
  "KSFO": { icao: "KSFO", iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", lat: 37.619, lon: -122.375 },
  "SFO": { icao: "KSFO", iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", lat: 37.619, lon: -122.375 },
  "UZSS": { icao: "UZSS", iata: "SKD", name: "Samarkand Airport", city: "Samarkand", lat: 39.701, lon: 66.984 },
  "SKD": { icao: "UZSS", iata: "SKD", name: "Samarkand Airport", city: "Samarkand", lat: 39.701, lon: 66.984 },
  "EGSS": { icao: "EGSS", iata: "STN", name: "London Stansted Airport", city: "London", lat: 51.885, lon: 0.235 },
  "STN": { icao: "EGSS", iata: "STN", name: "London Stansted Airport", city: "London", lat: 51.885, lon: 0.235 },
  "EDDS": { icao: "EDDS", iata: "STR", name: "Stuttgart Airport", city: "Stuttgart", lat: 48.69, lon: 9.222 },
  "STR": { icao: "EDDS", iata: "STR", name: "Stuttgart Airport", city: "Stuttgart", lat: 48.69, lon: 9.222 },
  "YSSY": { icao: "YSSY", iata: "SYD", name: "Sydney Kingsford Smith International Airport", city: "Sydney", lat: -33.946, lon: 151.177 },
  "SYD": { icao: "YSSY", iata: "SYD", name: "Sydney Kingsford Smith International Airport", city: "Sydney", lat: -33.946, lon: 151.177 },
  "UGTB": { icao: "UGTB", iata: "TBS", name: "Tbilisi International Airport", city: "Tbilisi", lat: 41.669, lon: 44.955 },
  "TBS": { icao: "UGTB", iata: "TBS", name: "Tbilisi International Airport", city: "Tbilisi", lat: 41.669, lon: 44.955 },
  "OETF": { icao: "OETF", iata: "TIF", name: "Taif Airport", city: "Taif", lat: 21.483, lon: 40.544 },
  "TIF": { icao: "OETF", iata: "TIF", name: "Taif Airport", city: "Taif", lat: 21.483, lon: 40.544 },
  "FMMI": { icao: "FMMI", iata: "TNR", name: "Ivato Airport", city: "Antananarivo", lat: -18.797, lon: 47.479 },
  "TNR": { icao: "FMMI", iata: "TNR", name: "Ivato Airport", city: "Antananarivo", lat: -18.797, lon: 47.479 },
  "ZMCK": { icao: "ZMCK", iata: "UBN", name: "Chinggis Khaan International Airport", city: "Ulaanbaatar", lat: 47.652, lon: 106.822 },
  "UBN": { icao: "ZMCK", iata: "UBN", name: "Chinggis Khaan International Airport", city: "Ulaanbaatar", lat: 47.652, lon: 106.822 },
  "SEQM": { icao: "SEQM", iata: "UIO", name: "Nuevo Aeropuerto Internacional Mariscal Sucre", city: "Quito", lat: -0.129, lon: -78.358 },
  "UIO": { icao: "SEQM", iata: "UIO", name: "Nuevo Aeropuerto Internacional Mariscal Sucre", city: "Quito", lat: -0.129, lon: -78.358 },
  "LIPZ": { icao: "LIPZ", iata: "VCE", name: "Venezia / Tessera -  Marco Polo Airport", city: "Venezia", lat: 45.505, lon: 12.352 },
  "VCE": { icao: "LIPZ", iata: "VCE", name: "Venezia / Tessera -  Marco Polo Airport", city: "Venezia", lat: 45.505, lon: 12.352 },
  "LOWW": { icao: "LOWW", iata: "VIE", name: "Vienna International Airport", city: "Vienna", lat: 48.11, lon: 16.57 },
  "VIE": { icao: "LOWW", iata: "VIE", name: "Vienna International Airport", city: "Vienna", lat: 48.11, lon: 16.57 },
  "UUWW": { icao: "UUWW", iata: "VKO", name: "Vnukovo International Airport", city: "Moscow", lat: 55.591, lon: 37.262 },
  "VKO": { icao: "UUWW", iata: "VKO", name: "Vnukovo International Airport", city: "Moscow", lat: 55.591, lon: 37.262 },
  "LEVC": { icao: "LEVC", iata: "VLC", name: "Valencia Airport", city: "Valencia", lat: 39.489, lon: -0.482 },
  "VLC": { icao: "LEVC", iata: "VLC", name: "Valencia Airport", city: "Valencia", lat: 39.489, lon: -0.482 },
  "EYVI": { icao: "EYVI", iata: "VNO", name: "Vilnius International Airport", city: "Vilnius", lat: 54.634, lon: 25.286 },
  "VNO": { icao: "EYVI", iata: "VNO", name: "Vilnius International Airport", city: "Vilnius", lat: 54.634, lon: 25.286 },
  "CYUL": { icao: "CYUL", iata: "YUL", name: "Montreal / Pierre Elliott Trudeau International Airport", city: "Montreal", lat: 45.471, lon: -73.741 },
  "YUL": { icao: "CYUL", iata: "YUL", name: "Montreal / Pierre Elliott Trudeau International Airport", city: "Montreal", lat: 45.471, lon: -73.741 },
  "CYVR": { icao: "CYVR", iata: "YVR", name: "Vancouver International Airport", city: "Vancouver", lat: 49.194, lon: -123.184 },
  "YVR": { icao: "CYVR", iata: "YVR", name: "Vancouver International Airport", city: "Vancouver", lat: 49.194, lon: -123.184 },
  "LSZH": { icao: "LSZH", iata: "ZRH", name: "Zurich Airport", city: "Zurich", lat: 47.465, lon: 8.549 },
  "ZRH": { icao: "LSZH", iata: "ZRH", name: "Zurich Airport", city: "Zurich", lat: 47.465, lon: 8.549 },
};

const CARGO_FLEET_DETAILS = {
  // Boeing 777F
  "4bb14c": { registration: "TC-LJL", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb14d": { registration: "TC-LJM", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb14e": { registration: "TC-LJN", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb14f": { registration: "TC-LJO", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb150": { registration: "TC-LJP", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb152": { registration: "TC-LJR", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb153": { registration: "TC-LJS", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb154": { registration: "TC-LJT", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb155": { registration: "TC-LJU", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb156": { registration: "TC-LJV", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb159": { registration: "TC-LJY", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  "4bb15a": { registration: "TC-LJZ", type: "Boeing 777-F", icaoType: "B77L", manufacturer: "Boeing", owner: "Turkish Cargo" },
  // Airbus A330F
  "4ba88f": { registration: "TC-JDO", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" },
  "4ba9fa": { registration: "TC-JOZ", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" },
  "4ba890": { registration: "TC-JDP", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" },
  "4ba891": { registration: "TC-JDQ", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" },
  "4ba892": { registration: "TC-JDR", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" },
  "4ba893": { registration: "TC-JDS", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" },
  "4ba9ef": { registration: "TC-JOU", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" },
  "4ba9f4": { registration: "TC-JOV", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" },
  "4ba9f6": { registration: "TC-JOW", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" },
  "4ba9f9": { registration: "TC-JOY", type: "Airbus A330-200F", icaoType: "A332", manufacturer: "Airbus", owner: "Turkish Cargo" }
};

const CARGO_STATIC_ROUTES = {
  "THY6116": [
    { dep: "HLLM", arr: "HECA" }, // Tripoli (Mitiga) -> Cairo
    { dep: "HECA", arr: "HLLM" }, // Cairo -> Tripoli (Mitiga)
    { dep: "LEMD", arr: "LTFM" }, // Madrid -> Istanbul
    { dep: "LTFM", arr: "LEMD" }  // Istanbul -> Madrid
  ],
  "THY6058": [
    { dep: "GOBD", arr: "LTFM" }, // Dakar -> Istanbul
    { dep: "LTFM", arr: "GOBD" }  // Istanbul -> Dakar
  ],
  "THY6112": [
    { dep: "LTFM", arr: "VABB" }, // Istanbul -> Mumbai
    { dep: "VABB", arr: "LTFM" }  // Mumbai -> Istanbul
  ],
  "THY6421": [
    { dep: "LTFM", arr: "LFPG" }, // Istanbul -> Paris
    { dep: "LFPG", arr: "LTFM" }, // Paris -> Istanbul
    { dep: "LFSB", arr: "LTFM" }, // Basel -> Istanbul
    { dep: "LTFM", arr: "LFSB" }  // Istanbul -> Basel
  ],
  "THY6091": [
    { dep: "LTFM", arr: "EBLG" }, // Istanbul -> Liège
    { dep: "EBLG", arr: "LTFM" }  // Liège -> Istanbul
  ],
  "THY6118": [
    { dep: "LTFM", arr: "VOMM" }, // Istanbul -> Chennai (MAA)
    { dep: "VOMM", arr: "LTFM" }  // Chennai -> Istanbul
  ],
  "THY6251": [
    { dep: "RCTP", arr: "LTFM" }, // Taipei -> Istanbul
    { dep: "LTFM", arr: "RCTP" }  // Istanbul -> Taipei
  ],
  "THY6261": [
    { dep: "LTFM", arr: "OJAI" }, // Istanbul -> Amman
    { dep: "OJAI", arr: "VVNB" }, // Amman -> Hanoi
    { dep: "VVNB", arr: "VIDP" }, // Hanoi -> Delhi
    { dep: "VIDP", arr: "LTFM" }  // Delhi -> Istanbul
  ],
  "THY6215": [
    { dep: "LTFM", arr: "ZGSZ" }, // Istanbul -> Shenzhen
    { dep: "ZGSZ", arr: "UAII" }, // Shenzhen -> Shymkent
    { dep: "UAII", arr: "LTFM" }, // Shymkent -> Istanbul
    { dep: "UAII", arr: "ZGSZ" }, // Shymkent -> Shenzhen
    { dep: "ZGSZ", arr: "LTFM" }, // Shenzhen -> Istanbul
    { dep: "LTFM", arr: "UAII" }  // Istanbul -> Shymkent
  ],
  "THY6455": [
    { dep: "LTFM", arr: "EBBR" }, // Istanbul -> Brussels
    { dep: "EBBR", arr: "LTFM" }  // Brussels -> Istanbul
  ],
  "THY6212": [
    { dep: "VVTS", arr: "LTFM" }, // Ho Chi Minh -> Istanbul
    { dep: "WSSS", arr: "LTFM" }, // Singapore -> Istanbul
    { dep: "VVTS", arr: "WSSS" }, // Ho Chi Minh -> Singapore
    { dep: "WSSS", arr: "VVTS" }, // Singapore -> Ho Chi Minh
    { dep: "LTFM", arr: "VVTS" }, // Istanbul -> Ho Chi Minh
    { dep: "LTFM", arr: "WSSS" }  // Istanbul -> Singapore
  ],
  "THY6509": [
    { dep: "LTFM", arr: "LKPR" }, // Istanbul -> Prague
    { dep: "LKPR", arr: "LTFM" }, // Prague -> Istanbul
    { dep: "VIDP", arr: "LTFM" }, // Delhi -> Istanbul
    { dep: "VABB", arr: "LTFM" }, // Mumbai -> Istanbul
    { dep: "ZGGG", arr: "LTFM" }, // Guangzhou -> Istanbul
    { dep: "OTHH", arr: "LTFM" }, // Doha -> Istanbul
    { dep: "OMDB", arr: "LTFM" }, // Dubai -> Istanbul
    { dep: "OIII", arr: "LTFM" }  // Tehran -> Istanbul
  ],
  "THY6577": [
    { dep: "ZGGG", arr: "LTFM" }, // Guangzhou -> Istanbul
    { dep: "LTFM", arr: "ZGGG" }  // Istanbul -> Guangzhou
  ],
  "THY6690": [
    { dep: "LTFM", arr: "LEMD" }, // Istanbul -> Madrid
    { dep: "LEMD", arr: "LTFM" }  // Madrid -> Istanbul
  ],
  "THY6148": [
    { dep: "LTFM", arr: "VGHS" }, // Istanbul -> Dhaka
    { dep: "VGHS", arr: "LTFM" }  // Dhaka -> Istanbul
  ],
  "THY6413": [
    { dep: "LTFM", arr: "GOBD" }, // Istanbul -> Dakar
    { dep: "GOBD", arr: "LTFM" }, // Dakar -> Istanbul
    { dep: "LTFM", arr: "KJFK" }, // Istanbul -> New York
    { dep: "KJFK", arr: "LTFM" }  // New York -> Istanbul
  ],
  "THY6663": [
    { dep: "OPKC", arr: "LTFM" }, // Karachi -> Istanbul
    { dep: "LTFM", arr: "OPKC" }, // Istanbul -> Karachi
    { dep: "KORD", arr: "LTFM" }, // Chicago -> Istanbul
    { dep: "LTFM", arr: "KORD" }  // Istanbul -> Chicago
  ],
  "THY6691": [
    { dep: "OMDW", arr: "LTFM" }, // Dubai -> Istanbul
    { dep: "LTFM", arr: "OMDW" }  // Istanbul -> Dubai
  ],
  "THY6202": [
    { dep: "LTFM", arr: "OERK" }, // Istanbul -> Riyadh
    { dep: "OERK", arr: "LTFM" }, // Riyadh -> Istanbul
    { dep: "OERK", arr: "VVNB" }, // Riyadh -> Hanoi
    { dep: "VVNB", arr: "OERK" }  // Hanoi -> Riyadh
  ],
  "THY6228": [
    { dep: "LTFM", arr: "VVTS" }, // Istanbul -> Ho Chi Minh City (SGN)
    { dep: "VVTS", arr: "LTFM" }, // Ho Chi Minh City -> Istanbul
    { dep: "LTFM", arr: "VTBS" }, // Istanbul -> Bangkok (BKK)
    { dep: "VTBS", arr: "LTFM" }, // Bangkok -> Istanbul
    { dep: "VTBS", arr: "VVTS" }, // Bangkok -> Ho Chi Minh City
    { dep: "VVTS", arr: "VTBS" }  // Ho Chi Minh City -> Bangkok
  ],
  "THY6111": [
    { dep: "LTFM", arr: "VABB" }, // Istanbul -> Mumbai (BOM)
    { dep: "VABB", arr: "LTFM" }  // Mumbai -> Istanbul
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

  // Strip HTML tags and normalize whitespace to avoid issues with inline tags breaking matches
  const cleanText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  // Primary: "fell/rose X.X% compared to the week before to $X.XX/bbl"
  const primaryRe = /global average jet fuel price last week\s+(fell|dropped|declined|decreased|rose|increased|surged|remained\s+unchanged|was\s+unchanged)\s+(?:by\s+)?(\d+\.?\d*)?%?\s*compared to the week before to\s+\$(\d+\.?\d+)\/bbl/i;
  let match = cleanText.match(primaryRe);
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
    const bblMatch = cleanText.match(/\$(\d+\.?\d+)\/bbl/i);
    if (bblMatch) price = parseFloat((parseFloat(bblMatch[1]) * BBL_TO_MT).toFixed(1));
  }

  // Fallback: cts/gal value
  if (price === null) {
    const ctsMatch = cleanText.match(/(\d+\.?\d+)\s*(?:cts|cents?)\/gal/i);
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
    const dm = cleanText.match(p);
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

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/&#([0-9]+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
            .replace(/&rsquo;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"');
}

function parseFriendlyPrice(str) {
  if (!str) return null;
  const m = str.match(/([\d.,]+)/);
  if (!m) return null;
  let numStr = m[1];
  
  if (numStr.includes('.') && numStr.includes(',')) {
    const dotIdx = numStr.indexOf('.');
    const commaIdx = numStr.indexOf(',');
    if (dotIdx < commaIdx) {
      // Turkish format: 4.166,50 -> remove dots, replace comma with dot
      numStr = numStr.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // English format: 4,166.50 -> remove commas
      numStr = numStr.replace(/,/g, '');
    }
  } else if (numStr.includes('.')) {
    const parts = numStr.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      numStr = numStr.replace(/\./g, '');
    } else if (parts.length > 2) {
      numStr = numStr.replace(/\./g, '');
    }
  } else if (numStr.includes(',')) {
    const parts = numStr.split(',');
    if (parts.length === 2 && parts[1].length === 3) {
      numStr = numStr.replace(/,/g, '');
    } else if (parts.length > 2) {
      numStr = numStr.replace(/,/g, '');
    } else {
      numStr = numStr.replace(/,/g, '.');
    }
  }
  
  return parseFloat(numStr);
}

function parseWCI(html) {
  // HTML entity'lerini temizle
  const cleanHtml = decodeHtmlEntities(html);

  // 1. Raporun yayınlanma tarihini bul
  const dateMatch = cleanHtml.match(/Our detailed assessment for [A-Za-z]+,\s+([\d]+\s+[A-Za-z]+\s+[\d]{4})/i);
  const dateStr = dateMatch ? dateMatch[1] : null;

  // 2. Metinden (body) fiyatı bul (Regex Yöntemi)
  const directionWords = 'increased|decreased|remained(?:\\s+(?:steady|unchanged))?|dropped|declined|surged|jumped|climbed|gained|soared|slipped|eased|rose|fell|changed|edged\\s+(?:up|down)';
  const wciRegex = new RegExp(`The Drewry World Container Index \\(WCI\\)[^.]{0,120}?(${directionWords})(?:\\s+by)?\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i');
  let bodyMatch = cleanHtml.match(wciRegex);

  if (!bodyMatch) {
    const fallbackRegex = new RegExp(`composite index[^.]{0,120}?(${directionWords})(?:\\s+by)?\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i');
    bodyMatch = cleanHtml.match(fallbackRegex);
  }

  let priceBodyRegex = null;
  let directionStr = 'flat';
  let changePercentVal = 0;
  
  if (bodyMatch) {
    directionStr = bodyMatch[1].toLowerCase();
    changePercentVal = bodyMatch[2] ? parseFloat(bodyMatch[2]) : 0;
    priceBodyRegex = parseFriendlyPrice(bodyMatch[3]);
  }

  // 3. Meta açıklamadan (description) fiyatı bul
  const metaRegex = /World Container Index\s*\(WCI\)[^]*?\$([\d,]+)/i;
  const descMatch = cleanHtml.match(/<meta[^>]*?name="description"[^>]*?content="([^"]*?)"/i) ||
                    cleanHtml.match(/<meta[^>]*?content="([^"]*?)"[^>]*?name="description"/i) ||
                    cleanHtml.match(/<meta[^>]*?property="og:description"[^>]*?content="([^"]*?)"/i);
  
  let priceMeta = null;
  if (descMatch) {
    const metaText = descMatch[1];
    const metaPriceMatch = metaText.match(metaRegex);
    if (metaPriceMatch) {
      priceMeta = parseFriendlyPrice(metaPriceMatch[1]);
    }
  }

  // 4. "Our detailed assessment" altındaki ilk maddeden fiyatı bul (DOM/HTML Yapı Yöntemi)
  let priceFirstBullet = null;
  const headingIndex = cleanHtml.search(/Our detailed assessment/i);
  if (headingIndex !== -1) {
    const subHtml = cleanHtml.slice(headingIndex);
    const liMatch = subHtml.match(/<li[^>]*>([\s\S]*?)<\/li>/i);
    if (liMatch) {
      const liText = liMatch[1];
      // İlk geçen fiyatı al
      const priceMatch = liText.match(/\$([\d,]+)/);
      if (priceMatch) {
        priceFirstBullet = parseFriendlyPrice(priceMatch[1]);
      }
    }
  }

  // 5. Alt rotaların fiyatlarını çıkar (çakışma kontrolü için)
  const routePrices = [];
  const routeRegex = /(?:Shanghai|Rotterdam|Genoa|New York|Los Angeles)\s+(?:to|-[A-Za-z]+)\s+(?:Shanghai|Rotterdam|Genoa|New York|Los Angeles)[^.]{0,100}?(?:increased|decreased|remained|unchanged|steady|dropped|declined|surged|jumped|climbed|gained|soared|slipped|eased|rose|fell|changed|edged|at|to)\s*(?:[\d.]+(?:%)?)?\s*(?:to|at)?\s*\$([\d,]+)/gi;
  let routeMatch;
  while ((routeMatch = routeRegex.exec(cleanHtml)) !== null) {
    const val = parseFriendlyPrice(routeMatch[1]);
    if (val && !routePrices.includes(val)) {
      routePrices.push(val);
    }
  }

  // 6. Çoklu Kanal Doğrulama ve Karar Mekanizması (Triple-Channel Consensus)
  const candidates = [priceBodyRegex, priceMeta, priceFirstBullet].filter(p => p !== null);
  
  // Aday fiyatların frekansını sayalım
  const counts = {};
  for (const p of candidates) {
    counts[p] = (counts[p] || 0) + 1;
  }

  let finalPrice = null;
  
  // En çok tekrarlanan (çoğunluk oyu alan) fiyatı seçelim
  let maxCount = 0;
  for (const p in counts) {
    if (counts[p] > maxCount) {
      maxCount = counts[p];
      finalPrice = parseFloat(p);
    }
  }

  // Eğer güvenilir bir çoğunluk yoksa (ör. tüm adaylar farklıysa veya aday yoksa) hata ver
  if (!finalPrice || maxCount < 2) {
    return {
      success: false,
      error: `Verification mismatch: Candidates was [BodyRegex: ${priceBodyRegex}, Meta: ${priceMeta}, FirstBullet: ${priceFirstBullet}]`
    };
  }

  // Çoğunluk oyu alan fiyatın alt rotalardan biriyle çakışıp çakışmadığını denetle
  if (routePrices.includes(finalPrice)) {
    // Eğer kazara alt rotalardan biri çoğunluk oyu aldıysa, çakışmayan temiz diğer adaya bak
    const safeCandidate = candidates.find(p => p !== finalPrice && !routePrices.includes(p));
    if (safeCandidate) {
      finalPrice = safeCandidate;
    } else {
      return {
        success: false,
        error: `Price verification failed: Detected price $${finalPrice} is a trade route rate, and no safe fallback found.`
      };
    }
  }

  // Makul Değer Kontrolü (Sanity Check)
  if (finalPrice < 500 || finalPrice > 15000) {
    return {
      success: false,
      error: `Sanity check failed: Price $${finalPrice} is out of expected range ($500 - $15,000)`
    };
  }

  const downWords = ['decreased', 'dropped', 'declined', 'fell', 'slipped', 'eased'];
  const upWords = ['increased', 'surged', 'rose', 'jumped', 'climbed', 'gained', 'soared'];

  let changePercent = changePercentVal;
  if (downWords.includes(directionStr)) {
    changePercent = -changePercentVal;
  } else if (directionStr.startsWith('edged down')) {
    changePercent = -changePercentVal;
  }

  let direction = 'flat';
  if (upWords.includes(directionStr) || directionStr.startsWith('edged up')) {
    direction = 'up';
  } else if (downWords.includes(directionStr) || directionStr.startsWith('edged down')) {
    direction = 'down';
  }

  return {
    success: true,
    price: finalPrice,
    change: changePercent,
    date: dateStr,
    direction
  };
}

function parseWciRoutes(html) {
  const cleanHtml = decodeHtmlEntities(html);
  const routes = {};
  
  const directionWords = 'increased|decreased|remained(?:\\s+(?:steady|unchanged))?|dropped|declined|surged|jumped|climbed|gained|soared|slipped|eased|rose|fell|changed|edged\\s+(?:up|down)|rising|increasing|holding|steady|unchanged|dropping|falling|climbing';
  const routeConfigs = [
    { key: 'Shanghai - Rotterdam', pattern: new RegExp(`(?:Shanghai\\s+to\\s+Rotterdam|Shanghai-Rotterdam)[^.]{0,100}?(${directionWords})\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i') },
    { key: 'Rotterdam - Shanghai', pattern: new RegExp(`(?:Rotterdam\\s+to\\s+Shanghai|Rotterdam-Shanghai)[^.]{0,100}?(${directionWords})\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i') },
    { key: 'Shanghai - Genoa', pattern: new RegExp(`(?:Shanghai\\s+to\\s+Genoa|Shanghai-Genoa)[^.]{0,100}?(${directionWords})\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i') },
    { key: 'Genoa - Shanghai', pattern: new RegExp(`(?:Genoa\\s+to\\s+Shanghai|Genoa-Shanghai)[^.]{0,100}?(${directionWords})\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i') },
    { key: 'Shanghai - Los Angeles', pattern: new RegExp(`(?:Shanghai\\s+to\\s+Los\\s+Angeles|Shanghai-Los\\s+Angeles)[^.]{0,100}?(${directionWords})\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i') },
    { key: 'Los Angeles - Shanghai', pattern: new RegExp(`(?:Los\\s+Angeles\\s+to\\s+Shanghai|Los\\s+Angeles-Shanghai)[^.]{0,100}?(${directionWords})\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i') },
    { key: 'Shanghai - New York', pattern: new RegExp(`(?:Shanghai\\s+to\\s+New\\s+York|Shanghai-New\\s+York)[^.]{0,100}?(${directionWords})\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i') },
    { key: 'New York - Rotterdam', pattern: new RegExp(`(?:New\\s+York\\s+to\\s+Rotterdam|New\\s+York-Rotterdam)[^.]{0,100}?(${directionWords})\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i') },
    { key: 'Rotterdam - New York', pattern: new RegExp(`(?:Rotterdam\\s+to\\s+New\\s+York|Rotterdam-New\\s+New)[^.]{0,100}?(${directionWords})\\s*(?:([\\d.]+)(?:%)?)?\\s*(?:to|at)?\\s*\\$([\\d,]+)`, 'i') },
  ];

  const downWords = ['decreased', 'dropped', 'declined', 'fell', 'slipped', 'eased', 'dropping', 'falling'];
  const upWords = ['increased', 'surged', 'rose', 'jumped', 'climbed', 'gained', 'soared', 'rising', 'increasing', 'climbing'];

  for (const cfg of routeConfigs) {
    const match = cleanHtml.match(cfg.pattern);
    if (match) {
      const directionStr = match[1].toLowerCase();
      const changeVal = match[2] ? parseFloat(match[2]) : 0;
      const price = parseFriendlyPrice(match[3]);
      
      let change = changeVal;
      if (downWords.includes(directionStr) || directionStr.startsWith('edged down')) {
        change = -changeVal;
      }
      
      let direction = 'flat';
      if (upWords.includes(directionStr) || directionStr.startsWith('edged up')) {
        direction = 'up';
      } else if (downWords.includes(directionStr) || directionStr.startsWith('edged down')) {
        direction = 'down';
      }

      routes[cfg.key] = { price, change, direction };
    }
  }

  return routes;
}

function parseWciRoutesFromFallback(html) {
  const cleanHtml = decodeHtmlEntities(html);
  const routes = {};
  
  const metricRegex = /<div class="metric-card"[^>]*>[\s\S]*?<div class="metric-label">([^<]+)<\/div>[\s\S]*?<div class="metric-value">([^<]+)<\/div>[\s\S]*?(?:<div class="metric-change"[^>]*>([^<]+)<\/div>)?/gi;
  let match;
  while ((match = metricRegex.exec(cleanHtml)) !== null) {
    const label = match[1].trim();
    if (label.includes('Şanghay') || label.includes('New York') || label.includes('Rotterdam') || label.includes('Cenova') || label.includes('Los Angeles')) {
      let key = label.replace(/Şanghay/g, 'Shanghai').replace(/Cenova/g, 'Genoa');
      const price = parseFriendlyPrice(match[2]);
      if (price) {
        let change = 0;
        let direction = 'flat';
        if (match[3]) {
          const changeStr = match[3].replace(/[^\d.-]/g, '');
          change = parseFloat(changeStr) || 0;
          if (match[3].includes('▲')) {
            direction = 'up';
          } else if (match[3].includes('▼')) {
            direction = 'down';
            change = -change;
          }
        }
        routes[key] = { price, change, direction };
      }
    }
  }
  return routes;
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
          } else {
            console.warn(`[Funnel] Proxy request failed with status: ${funnelResp.status} for URL: ${url}`);
          }
        } catch (err) {
          console.error(`[Funnel] Connection error: ${err.message || err} for URL: ${url}`);
        }
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
      let parsed = null;
      let fetchFailed = false;
      let proxyUsed = 'none';
      let liveRoutes = {};

      try {
        const res = await doFetch(drewryUrl, {}, forceDirect);
        proxyUsed = res.proxy;
        if (res.status === 200) {
          parsed = parseWCI(res.body);
          if (parsed && parsed.success) {
            liveRoutes = parseWciRoutes(res.body);
          }
        } else {
          fetchFailed = true;
          console.warn(`Drewry canlı sayfa isteği başarısız oldu (Status: ${res.status}). B planına geçiliyor...`);
        }
      } catch (err) {
        fetchFailed = true;
        console.error(`Drewry canlı istek hatası: ${err.message}. B planına geçiliyor...`);
      }

      // n8n Rapor Havuzundan Yedek Verileri Çek (Teyit ve yedekleme amacıyla her durumda çekiyoruz)
      let fallbackRoutes = {};
      let fallbackReport = null;
      try {
        const fallbackRes = await doFetch('https://n8n.emredemirbas.com/webhook/raporlar', {}, forceDirect);
        if (fallbackRes.status === 200) {
          const reportsJson = JSON.parse(fallbackRes.body);
          if (reportsJson.reports && reportsJson.reports.length > 0) {
            fallbackReport = reportsJson.reports[0];
            fallbackRoutes = parseWciRoutesFromFallback(fallbackReport.html_content);
          }
        }
      } catch (fallbackErr) {
        console.error("WCI B Planı n8n raporları çekilemedi:", fallbackErr.message);
      }

      // B Planı: Eğer canlı Drewry sitesi çekilemediyse veya doğrulama/parse başarısız olduysa n8n raporlarından çek
      if (fetchFailed || !parsed || !parsed.success) {
        if (fallbackReport) {
          const wciValM = fallbackReport.html_content.match(/WCI Bileşik Endeks<\/div>\s*<div[^>]*>([^<]+)<\/div>/i) ||
                          fallbackReport.html_content.match(/class="kpi"[^>]*>[\s\S]*?<span class="kpi-label">Drewry WCI<\/span><span class="kpi-value">([^<]+)<\/span>/i);

          if (wciValM) {
            const parsedPrice = parseFriendlyPrice(wciValM[1]);
            if (parsedPrice) {
              parsed = {
                success: true,
                price: parsedPrice,
                change: 0,
                direction: 'flat',
                date: new Date(fallbackReport.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
                isFallback: true
              };
            }
          }
        }
      }

      if (!parsed || !parsed.success) {
        return new Response(JSON.stringify({ error: 'Could not parse WCI data from live or fallback', detail: parsed ? parsed.error : 'unknown' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Rotaları Birleştir ve Teyit Et (Consensus & Verification)
      const finalRoutes = {};
      const allRouteKeys = new Set([...Object.keys(liveRoutes), ...Object.keys(fallbackRoutes)]);

      for (const key of allRouteKeys) {
        const liveVal = liveRoutes[key];
        const fallbackVal = fallbackRoutes[key];

        if (liveVal && fallbackVal) {
          if (liveVal.price === fallbackVal.price) {
            finalRoutes[key] = {
              price: liveVal.price,
              change: liveVal.change !== 0 ? liveVal.change : fallbackVal.change,
              direction: liveVal.direction !== 'flat' ? liveVal.direction : fallbackVal.direction,
              verified: true
            };
          } else {
            // Uyuşmazlık durumunda teyit edilmiş (insan kontrolünden geçmiş) n8n verisini seçiyoruz
            console.warn(`WCI Rota Uyuşmazlığı (${key}): Live ($${liveVal.price}) != Fallback ($${fallbackVal.price}). Fallback değeri seçildi.`);
            finalRoutes[key] = {
              price: fallbackVal.price,
              change: fallbackVal.change,
              direction: fallbackVal.direction,
              verified: true,
              mismatch: true
            };
          }
        } else if (liveVal) {
          // Sadece canlıda varsa: Sınır kontrolü uygulayarak kabul et
          if (liveVal.price >= 300 && liveVal.price <= 15000) {
            finalRoutes[key] = {
              price: liveVal.price,
              change: liveVal.change,
              direction: liveVal.direction,
              verified: false
            };
          }
        } else if (fallbackVal) {
          // Sadece n8n raporunda varsa: Direkt kabul et
          finalRoutes[key] = {
            price: fallbackVal.price,
            change: fallbackVal.change,
            direction: fallbackVal.direction,
            verified: true
          };
        }
      }

      parsed.routes = finalRoutes;

      // Cloudflare KV ile rota bazlı geçmişi kalıcı olarak biriktir
      if (env.FBX_ROUTES_KV) {
        try {
          const stored = await env.FBX_ROUTES_KV.get('wci_routes_history', { type: 'json' }) || {};
          let changed = false;
          const todayIso = new Date().toISOString().slice(0, 10);

          Object.entries(finalRoutes).forEach(([code, r]) => {
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
            await env.FBX_ROUTES_KV.put('wci_routes_history', JSON.stringify(stored));
          }
          parsed.routesHistory = stored;
        } catch (kvErr) {
          console.warn('WCI routes KV yazma hatası:', kvErr.message);
        }
      }

      parsed.routeNames = {
        'Shanghai - Rotterdam': 'Şanghay → Rotterdam',
        'Rotterdam - Shanghai': 'Rotterdam → Şanghay',
        'Shanghai - Genoa': 'Şanghay → Cenova',
        'Genoa - Shanghai': 'Cenova → Şanghay',
        'Shanghai - Los Angeles': 'Şanghay → Los Angeles',
        'Los Angeles - Shanghai': 'Los Angeles → Şanghay',
        'Shanghai - New York': 'Şanghay → New York',
        'New York - Rotterdam': 'New York → Rotterdam',
        'Rotterdam - New York': 'Rotterdam → New York'
      };

      return new Response(JSON.stringify(parsed), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Proxy': proxyUsed,
          'Cache-Control': 'public, max-age=3600',
        },
      });
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
          const wciValM = latestReport.html_content.match(/WCI Bileşik Endeks<\/div>\s*<div[^>]*>([^<]+)<\/div>/i) ||
                          latestReport.html_content.match(/class="kpi"[^>]*>[\s\S]*?<span class="kpi-label">Drewry WCI<\/span><span class="kpi-value">([^<]+)<\/span>/i);

          if (wciValM) {
            const parsedPrice = parseFriendlyPrice(wciValM[1]);
            if (parsedPrice) {
              parsed = {
                success: true,
                price: parsedPrice,
                change: 0,
                direction: 'flat',
                date: new Date(latestReport.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })
              };
            }
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
        const linkMatch = portalRes.body.match(/href=["']([^"']*?air-cargo-market-analysis-([a-z]+)-(\d{4})\/?)/i);
        
        let reportUrl = 'https://www.iata.org/en/publications/economics/';
        let reportMonth = '';
        if (linkMatch) {
          reportUrl = linkMatch[1];
          if (!reportUrl.startsWith('http')) {
            reportUrl = 'https://www.iata.org' + (reportUrl.startsWith('/') ? '' : '/') + reportUrl;
          }
          // Site, makale sayfasını "/publications/economics/reports/" altında yayınlıyor,
          // ama gerçek PDF indirme linki "/iata-repository/publications/economic-reports/" takma adında.
          reportUrl = reportUrl.replace('/publications/economics/reports/', '/iata-repository/publications/economic-reports/');
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
          publishedDate: latestReport.date,
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
            'Cache-Control': 'public, max-age=3600',
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

        // Prevent date advancing when the scraped data hasn't changed (IATA website not updated yet)
        if (env.FBX_ROUTES_KV) {
          try {
            const cacheKey = 'last_jetfuel_data';
            let cachedData = await env.FBX_ROUTES_KV.get(cacheKey, { type: 'json' });
            if (!cachedData) {
              // Seed with the last known static report data (June 19)
              cachedData = { price: 941.2, change: -14.2, date: '2026-06-19' };
              await env.FBX_ROUTES_KV.put(cacheKey, JSON.stringify(cachedData));
            }
            if (parsed.price === cachedData.price && parsed.change === cachedData.change) {
              parsed.date = cachedData.date;
            } else {
              // New data detected! Update the date to the parsed date and save
              cachedData = { price: parsed.price, change: parsed.change, date: parsed.date };
              await env.FBX_ROUTES_KV.put(cacheKey, JSON.stringify(cachedData));
            }
          } catch (e) {
            // Fail silently
          }
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
            await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(publicData), { expirationTtl: 86400 });
          } catch (_) {}
        }
        try {
          await caches.default.put(cacheKey, new Response(JSON.stringify(publicData), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=70' },
          }));
        } catch (_) {}
      }

      const TURKISH_CARGO_HEX = new Set([
        // Boeing 777F
        '4bb14c', '4bb14d', '4bb14e', '4bb14f', '4bb150', '4bb152', '4bb153', '4bb154', '4bb155', '4bb156', '4bb159', '4bb15a',
        // Airbus A330F
        '4ba88f', '4ba890', '4ba891', '4ba892', '4ba893', '4ba9ef', '4ba9f4', '4ba9f6', '4ba9f9', '4ba9fa',
        // Wet-leased freighters (ACT, ULS, BBN, Atlas Air, etc. regularly flying under THY callsigns)
        '4ba875', '4ba879', '4ba87b', '4ba87d', '4bae23', '4baa96',
        '4bb0b2', // TC-LER (A310-300F - ULS Cargo)
        '4b9c63', // TC-GCC (A321-200 P2F - BBN Airlines)
        '4b9df5', // TC-GOU (A330-300 P2F - ULS Cargo)
        '4b9dec', // TC-GOL (A330-300 P2F - ULS Cargo)
        'a54535'  // N439GT (B747-400F - Atlas Air)
      ]);

      function determineFlightType(icao24, flightNum, details) {
        const hex = icao24.toLowerCase();
        
        // 1. If it's a known dedicated or wet-leased freighter hex code, it's cargo.
        if (TURKISH_CARGO_HEX.has(hex)) {
          return 'cargo';
        }
        
        // 2. If it has aircraft details, we can check if it's explicitly a freighter/cargo aircraft
        if (details) {
          const type = (details.icaoType || details.type || '').toUpperCase();
          if (type.endsWith('F') && type !== 'B38M' && type !== 'B39M') {
            return 'cargo';
          }
          const desc = (details.type || '').toLowerCase();
          if (desc.includes('freighter') || desc.includes('cargo')) {
            return 'cargo';
          }
        }
        
        // 3. Fallback to Turkish Cargo flight number block range (6000 - 6499)
        const isCargoRange = (flightNum >= 6000 && flightNum <= 6499);
        return isCargoRange ? 'cargo' : 'pax';
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
            type: determineFlightType(icao24, flightNum, null),
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

      function getBearing(lat1, lon1, lat2, lon2) {
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const y = Math.sin(dLon) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
        const brng = Math.atan2(y, x) * 180 / Math.PI;
        return (brng + 360) % 360;
      }

      function isValidRouteForCallsign(callsign, depIcao, arrIcao) {
        if (!callsign) return true;
        const uCallsign = callsign.toUpperCase();
        const uDep = depIcao ? depIcao.toUpperCase() : '';
        const uArr = arrIcao ? arrIcao.toUpperCase() : '';

        if (uCallsign === 'THY6058' && uDep !== 'GOBD') {
          return false;
        }
        if (uCallsign === 'THY6261' && uDep === 'VIDP' && uArr === 'VVNB') {
          return false;
        }
        if (uCallsign === 'THY6259' && uDep !== 'VHHH') {
          return false;
        }
        return true;
      }

      function isRouteConsistent(f, dep, arr) {
        if (!dep || !arr || dep.lat == null || arr.lat == null) return false;
        if (!isValidRouteForCallsign(f.callsign, dep.icao, arr.icao)) return false;
        
        const dDep = getDistance(f.lat, f.lon, dep.lat, dep.lon);
        const dArr = getDistance(f.lat, f.lon, arr.lat, arr.lon);
        const dTotal = getDistance(dep.lat, dep.lon, arr.lat, arr.lon);
        
        // 1. Tighter distance limit (Allows up to 15% or +300km of routing detours/airspace closures)
        const maxAllowed = Math.max(dTotal * 1.15, dTotal + 300);
        if (dDep + dArr > maxAllowed) return false;
        
        // 2. Heading to destination check
        if (f.track != null) {
          const bearing = getBearing(f.lat, f.lon, arr.lat, arr.lon);
          let diff = Math.abs(f.track - bearing);
          if (diff > 180) diff = 360 - diff;
          if (diff > 90) return false;
        }
        
        // 3. Sector check: Plane must approach from the origin side of the destination.
        // We disable this when close to the destination (dArr <= 50) to allow landing patterns.
        if (dArr > 50) {
          const bearingToPlane = getBearing(arr.lat, arr.lon, f.lat, f.lon);
          const bearingToOrigin = getBearing(arr.lat, arr.lon, dep.lat, dep.lon);
          let diffSector = Math.abs(bearingToPlane - bearingToOrigin);
          if (diffSector > 180) diffSector = 360 - diffSector;
          if (diffSector > 60) return false;
        }
        
        return true;
      }

      async function getLearnedRoute(callsign, lat, lon, track) {
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
          if (uppercaseCallsign === 'THY6259') {
            const filtered = routes.filter(r => r.dep && r.dep.icao === 'VHHH');
            if (filtered.length !== routes.length) {
              routes = filtered;
              await env.FBX_ROUTES_KV.put(kvKey, JSON.stringify(routes));
            }
          }
          for (const r of routes) {
            if (r.dep && r.dep.lat != null && r.arr && r.arr.lat != null) {
              if (isRouteConsistent({ callsign: uppercaseCallsign, lat, lon, track }, r.dep, r.arr)) {
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
        const lowercaseIcao = icao24.toLowerCase();
        
        // Fleet details check first to bypass external API for our own cargo planes
        if (CARGO_FLEET_DETAILS[lowercaseIcao]) {
          return CARGO_FLEET_DETAILS[lowercaseIcao];
        }
        
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
          owner: ac.registered_owner || null,
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

      async function fetchRouteFromOpenSky(callsign) {
        const uppercaseCallsign = callsign.toUpperCase();
        const res = await doFetch(`https://opensky-network.org/api/routes?callsign=${uppercaseCallsign}`, {}, false, 86400);
        if (res.status !== 200) return null;
        let data;
        try { data = JSON.parse(res.body); } catch { return null; }
        if (!data || !Array.isArray(data.route) || data.route.length < 2) return null;
        const depIcao = data.route[0].toUpperCase();
        const arrIcao = data.route[data.route.length - 1].toUpperCase();
        
        let depDb = AIRPORT_DB[depIcao] ? { ...AIRPORT_DB[depIcao] } : { icao: depIcao, iata: null, name: depIcao, city: "Bilinmiyor", lat: null, lon: null };
        let arrDb = AIRPORT_DB[arrIcao] ? { ...AIRPORT_DB[arrIcao] } : { icao: arrIcao, iata: null, name: arrIcao, city: "Bilinmiyor", lat: null, lon: null };
        
        if (depDb.lat == null && env.AEROAPI_KEY) {
          const coords = await fetchAirportCoordsFromAeroAPI(depIcao);
          if (coords) {
            depDb.lat = coords.lat;
            depDb.lon = coords.lon;
          }
        }
        if (arrDb.lat == null && env.AEROAPI_KEY) {
          const coords = await fetchAirportCoordsFromAeroAPI(arrIcao);
          if (coords) {
            arrDb.lat = coords.lat;
            arrDb.lon = coords.lon;
          }
        }
        return { dep: depDb, arr: arrDb };
      }

      // ADS-B Exchange re-API — callsign bazlı uçuş bilgisi
      // Belgelenmemiş ama kararlı olan globe.adsbexchange.com/re-api endpoint'ini kullanır.
      // Cloudflare koruması yoktur, JSON döner ve anlık konum + squawk içerir.
      async function fetchRouteFromADSBX(callsign) {
        const uppercaseCallsign = callsign.toUpperCase();
        try {
          // İlk endpoint: callsign ile uçuşu bul, ICAO24 kodunu al
          const searchRes = await doFetch(
            `https://globe.adsbexchange.com/re-api/?find=${encodeURIComponent(uppercaseCallsign)}`,
            { headers: { 'Referer': 'https://globe.adsbexchange.com/', 'Accept': 'application/json' } },
            false, 300
          );
          if (searchRes.status !== 200) {
            console.warn(`[ADSBX] Search failed (${searchRes.status}) for ${uppercaseCallsign}`);
            return null;
          }
          let searchData;
          try { searchData = JSON.parse(searchRes.body); } catch { return null; }

          // ac: array of matching aircraft
          const acList = searchData?.ac || searchData?.aircraft || [];
          const ac = acList.find(a => (a.flight || '').trim().toUpperCase() === uppercaseCallsign) || acList[0];
          if (!ac) {
            console.warn(`[ADSBX] No aircraft found for callsign ${uppercaseCallsign}`);
            return null;
          }

          // from/to alanları bazı kayıtlarda mevcut
          const fromRaw = ac.from || null;
          const toRaw   = ac.to   || null;

          // ADSBX bazen "LTFM Istanbul" formatında döner — ICAO kodunu çek
          const extractIcao = (raw) => {
            if (!raw) return null;
            const m = raw.match(/^([A-Z]{4})/);
            return m ? m[1] : null;
          };

          const depIcao = extractIcao(fromRaw);
          const arrIcao = extractIcao(toRaw);

          if (!depIcao || !arrIcao) {
            console.warn(`[ADSBX] from/to fields missing or unparseable for ${uppercaseCallsign}: from=${fromRaw} to=${toRaw}`);
            return null;
          }

          const depDb = AIRPORT_DB[depIcao] || { icao: depIcao, iata: null, name: depIcao, city: 'Bilinmiyor', lat: null, lon: null };
          const arrDb = AIRPORT_DB[arrIcao] || { icao: arrIcao, iata: null, name: arrIcao, city: 'Bilinmiyor', lat: null, lon: null };

          console.log(`[ADSBX] Resolved route for ${uppercaseCallsign}: ${depIcao} -> ${arrIcao}`);
          return { dep: depDb, arr: arrDb };
        } catch (err) {
          console.error(`[ADSBX] Error for ${uppercaseCallsign}: ${err.message || err}`);
          return null;
        }
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

      async function fetchRouteFromFlightRadar24(callsign) {
        const uppercaseCallsign = callsign.toUpperCase();
        try {
          // Flightradar24'ün web geçmişi sayfasına istek atalım
          const res = await doFetch(`https://www.flightradar24.com/data/flights/${uppercaseCallsign.toLowerCase()}`, {}, false, 86400);
          if (res.status !== 200) {
            if (res.status === 403) {
              console.error(`[FlightRadar24] CAPTCHA / Cloudflare Challenge (403) detected on home IP for ${uppercaseCallsign}!`);
            } else {
              console.warn(`[FlightRadar24] HTTP status ${res.status} returned for ${uppercaseCallsign}`);
            }
            return null;
          }
          const html = res.body;
          if (!html) return null;
          
          if (html.includes("cf-challenge") || html.includes("hCaptcha") || html.includes("g-recaptcha") || html.includes("Attention Required! | Cloudflare")) {
            console.error(`[FlightRadar24] CAPTCHA / Cloudflare Challenge detected on home IP for ${uppercaseCallsign}!`);
            return null;
          }
          
          // HTML içindeki havalimanı ICAO kodlarını barındıran linkleri arayalım (/data/airports/ltfm vb.)
          const links = [...html.matchAll(/href="\/data\/airports\/([a-z]{4})"/g)].map(m => m[1].toUpperCase());
          if (links.length >= 2) {
            const depIcao = links[0];
            const arrIcao = links[1];
            const depDb = AIRPORT_DB[depIcao];
            const arrDb = AIRPORT_DB[arrIcao];
            if (depDb && arrDb) {
              console.log(`[FlightRadar24] Successfully resolved route for ${uppercaseCallsign}: ${depIcao} -> ${arrIcao}`);
              return { dep: depDb, arr: arrDb };
            }
          }
          
          const linksIata = [...html.matchAll(/href="\/data\/airports\/([a-z]{3})"/g)].map(m => m[1].toUpperCase());
          if (linksIata.length >= 2) {
            const depIata = linksIata[0];
            const arrIata = linksIata[1];
            const depDb = AIRPORT_DB[depIata];
            const arrDb = AIRPORT_DB[arrIata];
            if (depDb && arrDb) {
              console.log(`[FlightRadar24] Successfully resolved route for ${uppercaseCallsign}: ${depIata} -> ${arrIata}`);
              return { dep: depDb, arr: arrDb };
            }
          }
          
          console.warn(`[FlightRadar24] HTML parsing failed. Route links not found in history for ${uppercaseCallsign}.`);
        } catch (err) {
          console.error(`[FlightRadar24] Request error for ${uppercaseCallsign}: ${err.message || err}`);
        }
        return null;
      }

      async function fetchRouteFromFlightAware(callsign) {
        const uppercaseCallsign = callsign.toUpperCase();
        try {
          const res = await doFetch(`https://www.flightaware.com/live/flight/${uppercaseCallsign}`, {}, false, 86400);
          if (res.status !== 200) {
            console.warn(`[FlightAware] HTTP status ${res.status} returned for ${uppercaseCallsign}`);
            return null;
          }
          const html = res.body;
          if (!html) return null;
          
          const match = html.match(/var\s+trackpollBootstrap\s*=\s*(\{.+?\});<\/script>/);
          if (!match) {
            if (html.includes("cf-challenge") || html.includes("hCaptcha") || html.includes("g-recaptcha") || html.includes("Attention Required! | Cloudflare")) {
              console.error(`[FlightAware] CAPTCHA / Cloudflare Challenge detected on home IP for ${uppercaseCallsign}!`);
            } else if (html.includes("Access Denied") || html.includes("Access to this page has been denied") || html.includes("403 Forbidden")) {
              console.error(`[FlightAware] Access Denied / Blocked on home IP for ${uppercaseCallsign}!`);
            } else {
              console.warn(`[FlightAware] HTML parsing failed. trackpollBootstrap not found for ${uppercaseCallsign}.`);
            }
            return null;
          }
          
          const data = JSON.parse(match[1]);
          const flights = data.flights;
          if (!flights) return null;
          const flightIds = Object.keys(flights);
          if (flightIds.length === 0) return null;
          
          for (const fid of flightIds) {
            const fobj = flights[fid];
            const actFlights = fobj?.activityLog?.flights;
            if (actFlights && actFlights.length > 0) {
              const f = actFlights[0];
              const orig = f.origin;
              const dest = f.destination;
              if (orig && dest && (orig.icao || orig.iata) && (dest.icao || dest.iata)) {
                const depLat = orig.coord ? orig.coord[1] : null;
                const depLon = orig.coord ? orig.coord[0] : null;
                const arrLat = dest.coord ? dest.coord[1] : null;
                const arrLon = dest.coord ? dest.coord[0] : null;
                
                let depCity = orig.friendlyLocation || 'Bilinmiyor';
                if (depCity.includes(',')) depCity = depCity.split(',')[0].trim();
                let arrCity = dest.friendlyLocation || 'Bilinmiyor';
                if (arrCity.includes(',')) arrCity = arrCity.split(',')[0].trim();
                
                const depIcao = orig.icao ? orig.icao.toUpperCase() : null;
                const arrIcao = dest.icao ? dest.icao.toUpperCase() : null;
                
                const depDb = (depIcao && AIRPORT_DB[depIcao]) || {};
                const arrDb = (arrIcao && AIRPORT_DB[arrIcao]) || {};
                
                return {
                  dep: {
                    icao: depIcao || depDb.icao || null,
                    iata: orig.iata ? orig.iata.toUpperCase() : depDb.iata || null,
                    name: orig.friendlyName || depDb.name || null,
                    city: depCity || depDb.city || 'Bilinmiyor',
                    lat: depLat || depDb.lat || null,
                    lon: depLon || depDb.lon || null
                  },
                  arr: {
                    icao: arrIcao || arrDb.icao || null,
                    iata: dest.iata ? dest.iata.toUpperCase() : arrDb.iata || null,
                    name: dest.friendlyName || arrDb.name || null,
                    city: arrCity || arrDb.city || 'Bilinmiyor',
                    lat: arrLat || arrDb.lat || null,
                    lon: arrLon || arrDb.lon || null
                  }
                };
              }
            }
          }
        } catch (_) {}
        return null;
      }

      async function enrichInBackground(data, cachedFlights) {
        const { flights } = data;
        const cargoFlights = flights.filter(f => f.type === 'cargo');
        let cacheUpdated = false;
        
        for (const f of cargoFlights) {
          // 1. Rota tespiti (Hafızadan/API'den teyitli)
          if (!f.dep) {
            // Önce kendi KV'mizden öğrenilmiş rotaları kontrol et
            const learnedRoute = await getLearnedRoute(f.callsign, f.lat, f.lon, f.track);
            if (learnedRoute) {
              f.dep = learnedRoute.dep;
              f.arr = learnedRoute.arr;
              cacheUpdated = true;
            } else {
              // KV'de yoksa API'den çek ve teyit et
              try {
                let apiRoute = null;
                let valid = false;

                // 1. FlightAware (Browserless üzerinden, genellikle başarılı)
                if (!valid) {
                  const faRoute = await fetchRouteFromFlightAware(f.callsign);
                  if (faRoute && faRoute.dep && faRoute.arr) {
                    if (isRouteConsistent(f, faRoute.dep, faRoute.arr)) {
                      apiRoute = faRoute;
                      valid = true;
                    }
                  }
                }

                // 2. ADS-B Exchange (Cloudflare yok, ücretsiz, from/to alanları varsa hızlı)
                if (!valid) {
                  const adsbxRoute = await fetchRouteFromADSBX(f.callsign);
                  if (adsbxRoute && adsbxRoute.dep && adsbxRoute.arr) {
                    if (isRouteConsistent(f, adsbxRoute.dep, adsbxRoute.arr)) {
                      apiRoute = adsbxRoute;
                      valid = true;
                    }
                  }
                }

                // 3. Adsbdb API
                if (!valid) {
                  const adsbRoute = await fetchRouteFromAdsbdb(f.callsign);
                  if (adsbRoute && adsbRoute.dep && adsbRoute.arr) {
                    if (isRouteConsistent(f, adsbRoute.dep, adsbRoute.arr)) {
                      apiRoute = adsbRoute;
                      valid = true;
                    }
                  }
                }
                
                // 4. OpenSky Route API
                if (!valid) {
                  const osRoute = await fetchRouteFromOpenSky(f.callsign);
                  if (osRoute && osRoute.dep && osRoute.arr) {
                    if (isRouteConsistent(f, osRoute.dep, osRoute.arr)) {
                      apiRoute = osRoute;
                      valid = true;
                    }
                  }
                }
                
                // 5. Statik rota tablosu
                if (!valid) {
                  const candidates = CARGO_STATIC_ROUTES[f.callsign.toUpperCase()];
                  if (candidates) {
                    for (const c of candidates) {
                      const depDb = AIRPORT_DB[c.dep.toUpperCase()];
                      const arrDb = AIRPORT_DB[c.arr.toUpperCase()];
                      if (depDb && arrDb) {
                        if (isRouteConsistent(f, depDb, arrDb)) {
                          apiRoute = { dep: depDb, arr: arrDb };
                          valid = true;
                          break;
                        }
                      }
                    }
                  }
                }

                // 6. AeroAPI (ücretli, son çare)
                if (!valid && env.AEROAPI_KEY) {
                  const aeroRoute = await fetchRouteFromAeroAPI(f.callsign);
                  if (aeroRoute && aeroRoute.dep && aeroRoute.arr) {
                    if (isRouteConsistent(f, aeroRoute.dep, aeroRoute.arr)) {
                      apiRoute = aeroRoute;
                      valid = true;
                    }
                  }
                }

                // 7. FlightRadar24 (Cloudflare engelliyor, genellikle başarısız, en son denenir)
                if (!valid) {
                  const frRoute = await fetchRouteFromFlightRadar24(f.callsign);
                  if (frRoute && frRoute.dep && frRoute.arr) {
                    if (isRouteConsistent(f, frRoute.dep, frRoute.arr)) {
                      apiRoute = frRoute;
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
              await new Promise(r => setTimeout(r, Math.floor(Math.random() * 4001) + 3000));
            }
          }

          // 2. Uçak detaylarını (Tescil, Model, Fotoğraf) çek
          if (!f.aircraftDetails) {
            try {
              const acDetails = await fetchAircraftDetailsFromAdsbdb(f.icao24);
              if (acDetails) {
                f.aircraftDetails = acDetails;
                const flightNumMatch = f.callsign.match(/^THY(\d+)/);
                const flightNum = flightNumMatch ? parseInt(flightNumMatch[1], 10) : 0;
                f.type = determineFlightType(f.icao24, flightNum, acDetails);
                cacheUpdated = true;
              }
            } catch (_) {}
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 4001) + 3000));
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
            // Callsign bazlı rota filtrelerini uygula ve hatalı eski önbellek verilerini temizle
            if (prev.dep && !isValidRouteForCallsign(f.callsign, prev.dep.icao, prev.arr ? prev.arr.icao : null)) {
              prev.dep = null;
              prev.arr = null;
            }
            if (prev.dep && prev.dep.lat != null && prev.arr && prev.arr.lat != null) {
              // Verify that the aircraft is still flying along the cached route
              if (isRouteConsistent(f, prev.dep, prev.arr)) {
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
            const learnedRoute = await getLearnedRoute(f.callsign, f.lat, f.lon, f.track);
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
                  if (isRouteConsistent(f, depDb, arrDb)) {
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
          
          // Re-evaluate type now that details may have been populated from cache/KV
          const flightNumMatch = f.callsign.match(/^THY(\d+)/);
          const flightNum = flightNumMatch ? parseInt(flightNumMatch[1], 10) : 0;
          f.type = determineFlightType(f.icao24, flightNum, f.aircraftDetails);
        }

        // Re-calculate counts in case types were corrected
        fresh.count = fresh.flights.filter(f => f.type === 'cargo').length;
        fresh.paxCount = fresh.flights.filter(f => f.type === 'pax').length;

        const { token: _t, authHeaders: _a, ...publicData } = fresh;
        await setCachedFlights(publicData);
        ctx.waitUntil(enrichInBackground(fresh, cachedFlights).catch(() => {}));
        return publicData;
      }

      try {
        const isCron = urlObj.searchParams.get('cron') === '1';
        const cachedData = isCron ? null : await getCachedFlights();
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

  async scheduled(event, env, ctx) {
    const url = 'http://localhost/cargo-flights?cron=1';
    const request = new Request(url);
    ctx.waitUntil(
      this.fetch(request, env, ctx)
        .then(res => res.text())
        .then(() => console.log("Cron cache refresh completed successfully"))
        .catch(err => console.error("Cron cache refresh failed:", err))
    );
  }
};
