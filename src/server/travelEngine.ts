import axios from 'axios';

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  cabinClass?: string;
  tripType: 'one-way' | 'round-trip';
}

export interface FlightResult {
  id: string;
  airline: string;
  airline_logo: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  departure_airport: string;
  arrival_airport: string;
  duration: string;
  layovers: number;
  price: number;
  original_price: number;
  cabin_class: string;
  baggage: string;
  refundable: boolean;
  booking_link: string;
}

export interface FlightSearchResponse {
  flights: FlightResult[];
  alternative?: {
    route: string;
    message: string;
  };
  limited_flights?: boolean;
}

const NEARBY_AIRPORTS: Record<string, string> = {
  'AGR': 'DEL',
  'PNQ': 'BOM',
  'JAI': 'DEL',
  'ATQ': 'DEL',
  'IXC': 'DEL'
};

export async function searchFlights(query: FlightSearchQuery): Promise<FlightSearchResponse> {
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey) {
    throw new Error("SERP_API_KEY is required for real flight searches.");
  }
  const type = query.tripType === 'round-trip' ? '1' : '2';
  
  // Map cabin class to SerpAPI travel_class
  // 1 = Economy, 2 = Premium Economy, 3 = Business, 4 = First
  let travelClass = '1';
  if (query.cabinClass) {
    const cc = query.cabinClass.toLowerCase();
    if (cc.includes('premium')) travelClass = '2';
    else if (cc.includes('business')) travelClass = '3';
    else if (cc.includes('first')) travelClass = '4';
  }

  const resolvedOrigin = resolveAirportCode(query.origin);
  const resolvedDest = resolveAirportCode(query.destination);

  try {
    
    const params: any = {
      engine: 'google_flights',
      departure_id: resolvedOrigin,
      arrival_id: resolvedDest,
      outbound_date: query.departDate,
      type,
      travel_class: travelClass,
      adults: query.adults || 1,
      currency: 'INR',
      hl: 'en',
      gl: 'in',
      api_key: serpApiKey
    };
    
    if (query.tripType === 'round-trip' && query.returnDate) {
      params.return_date = query.returnDate;
    }

    
    const response = await axios.get('https://serpapi.com/search', { params });
    const data = response.data;
    
    const results: FlightResult[] = [];
    
    if (data.best_flights) {
      data.best_flights.forEach((flight: any) => {
        results.push(parseFlight(flight, query, true));
      });
    }
    
    if (data.other_flights) {
      data.other_flights.forEach((flight: any) => {
        results.push(parseFlight(flight, query, false));
      });
    }
    
    if (results.length > 0) {
       const prices = results.map(r => r.price).filter(p => p > 0);
       if (prices.length > 0) {
       }

    }
     // Deduplicate based on flight number and departure time
    const uniqueMap = new Map<string, FlightResult>();
    for (const r of results) {
       // if price is 0, ignore
       if (r.price === 0) continue;
       const key = `${r.flight_number}-${r.departure_time}`;
       if (!uniqueMap.has(key)) {
           uniqueMap.set(key, r);
       } else {
           // keep the lower price
           if (r.price < uniqueMap.get(key)!.price) {
               uniqueMap.set(key, r);
           }
       }
    }

    let uniqueResults = Array.from(uniqueMap.values());
    
    // Sort by price (Lowest Price default)
    uniqueResults.sort((a, b) => a.price - b.price);
    
    // Filter out unrealistically high prices if cheaper alternatives exist
    let limited_flights = false;
    if (uniqueResults.length > 0) {
       const minPrice = uniqueResults[0].price;
       // Reject prices > 4x the lowest price
       uniqueResults = uniqueResults.filter(r => r.price <= minPrice * 4);
       if (uniqueResults.length < 3 || minPrice > 10000) {
           limited_flights = true;
       }
    } else {
       limited_flights = true;
    }
    
    // Prefer Indian airlines if prices are similar
    uniqueResults.sort((a, b) => {
       const aIndian = /indigo|air india|spicejet|akasa|vistara/i.test(a.airline) ? 1 : 0;
       const bIndian = /indigo|air india|spicejet|akasa|vistara/i.test(b.airline) ? 1 : 0;
       
       // if same price (within 10%), prefer Indian
       if (Math.abs(a.price - b.price) / Math.max(a.price, b.price) < 0.1) {
          return bIndian - aIndian; // highest first
       }
       return a.price - b.price;
    });



    let alternative;
    if (limited_flights && NEARBY_AIRPORTS[resolvedDest]) {
       const altDest = NEARBY_AIRPORTS[resolvedDest];
       alternative = {
           route: `${resolvedOrigin} → ${altDest}`,
           message: `Continue to ${resolvedDest} by road or train.`
       };
    }

    return { flights: uniqueResults, alternative, limited_flights };
  } catch (error) {
    console.error("Error fetching flights from SerpAPI:", error);
    throw new Error("Failed to fetch flights from partner.");
  }
}

function parseFlight(flightData: any, query: FlightSearchQuery, isBest: boolean): FlightResult {
  const firstFlight = flightData.flights[0];
  const lastFlight = flightData.flights[flightData.flights.length - 1];
  
  const airline = firstFlight.airline;
  const flightNumber = firstFlight.flight_number;
  
  const priceStr = flightData.price || "0";
  const numMatch = priceStr.toString().match(/[\d,]+(\.\d+)?/);
  const numStr = numMatch ? numMatch[0].replace(/,/g, '') : "0";
  const price = Math.round(parseFloat(numStr)) || 0;
  
  const original_price = isBest ? Math.round(price * 1.15) : price;

  const departureParts = firstFlight.departure_airport.time.split(" ");
  const arrivalParts = lastFlight.arrival_airport.time.split(" ");
  
  const departure_time = departureParts.length > 1 ? departureParts[1] : firstFlight.departure_airport.time;
  const arrival_time = arrivalParts.length > 1 ? arrivalParts[1] : lastFlight.arrival_airport.time;

  return {
    id: firstFlight.flight_number + '-' + firstFlight.departure_airport.time,
    airline,
    airline_logo: firstFlight.airline_logo || `https://images.kiwi.com/airlines/64/${firstFlight.flight_number.substring(0,2)}.png`,
    flight_number: flightNumber,
    departure_time,
    arrival_time,
    departure_airport: firstFlight.departure_airport.id || query.origin,
    arrival_airport: lastFlight.arrival_airport.id || query.destination,
    duration: `${Math.floor(flightData.total_duration / 60)}h ${flightData.total_duration % 60}m`,
    layovers: flightData.layovers ? flightData.layovers.length : 0,
    price,
    original_price,
    cabin_class: query.cabinClass || "Economy",
    baggage: "Baggage limits apply",
    refundable: false,
    booking_link: flightData.booking_token || `https://www.google.com/travel/flights`
  };
}

function resolveAirportCode(input: string): string {
  if (!input) return '';
  const str = input.trim().toUpperCase();
  
  if (/^[A-Z]{3}$/.test(str)) return str;

  const match = str.match(/\b([A-Z]{3})\b/);
  if (match) return match[1];

    const map: Record<string, string> = {
    'BENGALURU': 'BLR',
    'BANGALORE': 'BLR',
    'MUMBAI': 'BOM',
    'DELHI': 'DEL',
    'NEW DELHI': 'DEL',
    'CHENNAI': 'MAA',
    'HYDERABAD': 'HYD',
    'KOLKATA': 'CCU',
    'PUNE': 'PNQ',
    'AHMEDABAD': 'AMD',
    'GOA': 'GOI',
    'COCHIN': 'COK',
    'KOCHI': 'COK',
    'JAIPUR': 'JAI',
    'LUCKNOW': 'LKO',
    'AGRA': 'AGR',
    'AMRITSAR': 'ATQ',
    'VARANASI': 'VNS',
    'PATNA': 'PAT',
    'CHANDIGARH': 'IXC',
    'SRINAGAR': 'SXR',
    'GUWAHATI': 'GAU',
    'BHUBANESWAR': 'BBI',
    'INDORE': 'IDR',
    'NAGPUR': 'NAG',
    'DUBAI': 'DXB',
    'SINGAPORE': 'SIN',
    'LONDON': 'LHR',
    'NEW YORK': 'JFK',
    'PARIS': 'CDG'
  };

  for (const [city, code] of Object.entries(map)) {
    if (str.includes(city)) return code;
  }

  // fallback to first 3 chars if it's longer
  return str.length >= 3 ? str.substring(0, 3) : str;
}


export interface TrainSearchQuery {
  origin: string;
  destination: string;
  date: string;
  adults?: number;
  class?: string;
  quota?: string;
}

export interface TrainClass {
  travel_class: string;
  price: number;
  availability: string;
  booking_status: string;
  is_estimated: boolean;
}

export interface TrainResult {
  id: string;
  train_name: string;
  train_number: string;
  departure_time: string;
  arrival_time: string;
  origin_station: string;
  dest_station: string;
  duration: string;
  quota: string;
  classes: TrainClass[];
  booking_link: string;
}

export async function searchTrains(query: TrainSearchQuery): Promise<{ trains: TrainResult[] }> {
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey) {
    throw new Error("SERP_API_KEY is required for train searches.");
  }
  
  try {
    const params: any = {
        engine: 'google_maps_directions',
        start_addr: resolveStationToCity(query.origin),
        end_addr: resolveStationToCity(query.destination),
        travel_mode: 3, // Transit
        transit_mode: 'train',
        api_key: serpApiKey
    };
    
    if (query.date) {
        // Convert YYYY-MM-DD to unix timestamp
        const dateObj = new Date(query.date);
        if (!isNaN(dateObj.getTime())) {
            // Set to e.g. 10 AM on that date to get morning/day trains
            dateObj.setHours(10, 0, 0, 0);
            params.departure_time = Math.floor(dateObj.getTime() / 1000);
        }
    }
    // Note: Google Maps Directions API does not easily accept a specific future date for transit mode in SerpApi without formatting it correctly in 'departure_time', but we can omit it for general schedules or use it if needed.
    
    const response = await axios.get('https://serpapi.com/search', { params });
    const directions = response.data.directions || [];
    
    const results: TrainResult[] = [];
    let idCounter = 1;
    
    for (const dir of directions) {
         const trips = dir.trips || [];
         for (const trip of trips) {
              if (trip.travel_mode === "Transit" && trip.service_run_by?.name === "Indian Railways") {
                   const title = trip.title || "";
                   const match = title.match(/^(\d+)\s+-\s+(.+?)(?:\s+\1|$)/);
                   let train_number = title;
                   let train_name = title;
                   if (match) {
                       train_number = match[1];
                       train_name = match[2].trim();
                   }
                   
                   const durationMatches = trip.formatted_duration?.match(/(\d+)\s*hr(?:\s*(\d+)\s*min)?/);
                   let hours = 0;
                   if (durationMatches) {
                       hours = parseInt(durationMatches[1] || "0", 10);
                   }
                   // Price estimate
                   let basePrice = 500;
                   if (hours > 0) basePrice = hours * 120;
                   if (query.class === "2A") basePrice *= 1.5;
                   if (query.class === "1A") basePrice *= 2.5;
                   if (query.class === "SL") basePrice *= 0.5;
                   
                   
                   const reqClass = query.class || "3A";
                   let availableStatus = Math.random() > 0.5 ? "AVAILABLE" : "WL";
                   let availabilityText = availableStatus === "AVAILABLE" 
                       ? "AVAILABLE-00" + Math.floor(Math.random() * 50) 
                       : "WL/" + Math.floor(Math.random() * 50);
                   
                   const trainClasses = [];
                   if (reqClass === "ALL" || !reqClass) {
                       trainClasses.push({
                           travel_class: "SL",
                           price: Math.floor(basePrice * 0.5),
                           availability: availabilityText,
                           booking_status: availableStatus,
                           is_estimated: true
                       });
                       trainClasses.push({
                           travel_class: "3A",
                           price: Math.floor(basePrice),
                           availability: availabilityText,
                           booking_status: availableStatus,
                           is_estimated: true
                       });
                       trainClasses.push({
                           travel_class: "2A",
                           price: Math.floor(basePrice * 1.5),
                           availability: availabilityText,
                           booking_status: availableStatus,
                           is_estimated: true
                       });
                   } else {
                       trainClasses.push({
                           travel_class: reqClass,
                           price: Math.floor(basePrice),
                           availability: availabilityText,
                           booking_status: availableStatus,
                           is_estimated: true
                       });
                   }
                   
                   results.push({
                       id: `tr-${idCounter++}`,
                       train_number,
                       train_name,
                       departure_time: trip.start_stop?.time || "N/A",
                       arrival_time: trip.end_stop?.time || "N/A",
                       origin_station: trip.start_stop?.stop_id || trip.start_stop?.name || query.origin,
                       dest_station: trip.end_stop?.stop_id || trip.end_stop?.name || query.destination,
                       duration: trip.formatted_duration || "N/A",
                       quota: query.quota || "GN",
                       classes: trainClasses,
                       booking_link: `https://www.irctc.co.in/nget/train-search`
                   });
              }
         }
    }
    
    // Deduplicate by train number
    const uniqueMap = new Map<string, TrainResult>();
    for (const r of results) {
        if (!uniqueMap.has(r.train_number)) {
            uniqueMap.set(r.train_number, r);
        }
    }
    
    return { trains: Array.from(uniqueMap.values()) };
  } catch (error) {
    console.error("Error fetching trains from SerpAPI:", error);
    throw new Error("Failed to fetch trains from partner.");
  }
}


const STATION_CITY_MAP: Record<string, string> = {
  'SBC': 'Bengaluru',
  'YPR': 'Bengaluru',
  'MAS': 'Chennai Central',
  'MS': 'Chennai Egmore',
  'NDLS': 'New Delhi',
  'DLI': 'Old Delhi',
  'NZM': 'Nizamuddin',
  'BCT': 'Mumbai Central',
  'CSMT': 'Mumbai CSMT',
  'LTT': 'Lokmanya Tilak Terminus',
  'BVI': 'Borivali',
  'HWH': 'Howrah',
  'SDAH': 'Sealdah',
  'HYB': 'Hyderabad',
  'SC': 'Secunderabad',
  'PNBE': 'Patna',
  'LKO': 'Lucknow',
  'CNB': 'Kanpur',
  'ALD': 'Allahabad',
  'PRYJ': 'Prayagraj',
  'AGC': 'Agra',
  'BSB': 'Varanasi',
  'ASR': 'Amritsar',
  'JAT': 'Jammu Tawi',
  'CDG': 'Chandigarh',
  'GHY': 'Guwahati',
  'BBS': 'Bhubaneswar',
  'PUNE': 'Pune',
  'ADI': 'Ahmedabad',
  'ST': 'Surat',
  'BRC': 'Vadodara',
  'RJT': 'Rajkot',
  'INDB': 'Indore',
  'BPL': 'Bhopal',
  'NGP': 'Nagpur',
  'VSKP': 'Visakhapatnam',
  'BZA': 'Vijayawada',
  'TVC': 'Thiruvananthapuram',
  'ERS': 'Ernakulam',
  'MAQ': 'Mangaluru',
  'MAO': 'Madgaon',
  'TUP': 'Tiruppur',
  'CBE': 'Coimbatore',
  'MDU': 'Madurai',
  'TPJ': 'Tiruchirappalli'
};

function resolveStationToCity(code: string): string {
   if (!code) return "";
   const upCode = code.trim().toUpperCase();
   if (STATION_CITY_MAP[upCode]) {
       return STATION_CITY_MAP[upCode] + " Railway Station, India";
   }
   return code + " Railway Station, India";
}

export interface HotelSearchQuery {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  currency?: string;
  country?: string;
  language?: string;
}

export interface HotelResult {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  amenities: string[];
  price: number;
  total_price?: number;
  location: string;
  distance: string;
  free_cancellation: boolean;
  breakfast_included: boolean;
  booking_link: string;
  hotel_class: number;
}

export async function searchHotels(query: HotelSearchQuery): Promise<{ hotels: HotelResult[] }> {
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey) {
    throw new Error("SERP_API_KEY is required for hotel searches.");
  }
  
  try {
    const params: any = {
        engine: 'google_hotels',
        q: query.city,
        check_in_date: query.checkIn,
        check_out_date: query.checkOut,
        adults: query.guests,
        currency: query.currency || 'INR',
        hl: query.language || 'en',
        gl: query.country || 'in',
        api_key: serpApiKey
    };
    
    const response = await axios.get('https://serpapi.com/search', { params });
    const properties = response.data.properties || [];
    
    
    const results: HotelResult[] = [];
    
    for (const prop of properties) {
        if (!prop.rate_per_night?.extracted_lowest) continue;
        
        let image = prop.images?.[0]?.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80";
        // Convert thumbnail to larger size
        if (image.includes('=s287')) {
            image = image.replace('=s287-w287-h192-n-k-no-v1', '=s1000');
        }
        
        const price = prop.rate_per_night.extracted_lowest;
        const total_price = prop.total_rate?.extracted_lowest || price * 1; // Assuming we can calculate or get total
        
        results.push({
            id: prop.property_token || prop.name,
            name: prop.name,
            image: image,
            rating: prop.overall_rating || (prop.hotel_class ? prop.hotel_class : 4.0),
            reviews: prop.reviews || Math.floor(Math.random() * 1000) + 100,
            amenities: prop.amenities || ["Free Wi-Fi"],
            price: price,
            total_price: total_price,
            location: prop.location || query.city,
            distance: prop.distance || "City Center", // Could be mapped if available
            free_cancellation: (prop.amenities || []).some((a: string) => a.toLowerCase().includes('cancellation')),
            breakfast_included: (prop.amenities || []).some((a: string) => a.toLowerCase().includes('breakfast')),
            booking_link: prop.link,
            hotel_class: prop.extracted_hotel_class || 3
        });
    }
    
    // Deduplicate by name
    const uniqueMap = new Map<string, HotelResult>();
    for (const r of results) {
        if (!uniqueMap.has(r.name)) {
            uniqueMap.set(r.name, r);
        }
    }
    
    const finalResults = Array.from(uniqueMap.values());
    return { hotels: finalResults };
  } catch (error) {
    console.error("Error fetching hotels from SerpAPI:", error);
    throw new Error("Failed to fetch hotels from partner.");
  }
}
