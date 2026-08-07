export interface HotelBookingParams {
  hotelName: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  currency?: string;
}

export function generateHotelBookingUrl(params: HotelBookingParams): string {
  // We construct a highly targeted search query to find the specific hotel
  const query = `${params.hotelName} ${params.city || ''}`.trim();
  
  // Use Booking.com for accurate hotel deep linking
  let targetUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}`;
  
  if (params.checkIn && params.checkOut) {
     targetUrl += `&checkin=${params.checkIn}&checkout=${params.checkOut}`;
  }
  
  if (params.guests) targetUrl += `&group_adults=${params.guests}`;
  if (params.rooms) targetUrl += `&no_rooms=${params.rooms}`;
  
  // Wrap with TravelPayouts affiliate marker
  const encodedTarget = encodeURIComponent(targetUrl);
  
  // Campaign 233 is for Booking.com (or we can use generic marker if needed)
  const affiliateUrl = `https://tp.media/r?campaign_id=233&marker=744135&p=4110&trs=543965&u=${encodedTarget}`;
  
  return affiliateUrl;
}

export interface TrainBookingParams {
  origin?: string;
  destination?: string;
  departDate?: string;
  adults?: number;
}

export function generateTrainBookingUrl(params: TrainBookingParams): string {
  // Use 12go for trains since Klook train deep links often redirect to homepage
  // For Indian trains 12go format: https://12go.asia/en/travel/delhi/mumbai?date=2026-10-10
  
  let targetUrl = `https://12go.asia/en/travel/${encodeURIComponent(params.origin || '')}/${encodeURIComponent(params.destination || '')}`;
  
  if (params.departDate) {
      targetUrl += `?date=${params.departDate}`;
  }
  
  const encodedTarget = encodeURIComponent(targetUrl);
  
  // Campaign 258 is typically 12go
  const affiliateUrl = `https://tp.media/r?campaign_id=258&marker=744135&p=4110&trs=543965&u=${encodedTarget}`;
  
  return affiliateUrl;
}
