/**
 * Ticketmaster API Integration via Proxy
 * Documentation: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:4001';

console.log('🔧 Ticketmaster API configured to use proxy:', PROXY_URL);

/**
 * Get events from Ticketmaster API
 */
export const getEvents = async (params = {}) => {
  console.log('🎫 getEvents called with params:', params);
  console.log('🔑 API Key present:', !!API_KEY);
  console.log('🔑 API Key value:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'MISSING');
  
  if (!API_KEY) {
    console.error('❌ Ticketmaster API key not found. Please set VITE_TICKETMASTER_API_KEY in .env file');
    return [];
  }

  try {
    const queryParams = new URLSearchParams({
      apikey: API_KEY,
      size: params.size || 200,
      classificationName: params.classificationName || 'Music',
      sort: params.sort || 'date,asc',
      ...params
    });

    const url = `${BASE_URL}events.json?${queryParams.toString()}`;
    console.log('� Full URL (with hidden key):', url.replace(API_KEY, 'API_KEY_HIDDEN'));
    console.log('�🎫 Fetching events from Ticketmaster API...');

    const response = await fetch(url);
    
    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📡 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Response Error:', errorText);
      throw new Error(`Ticketmaster API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Raw API response:', data);
    
    const events = data._embedded?.events || [];
    
    console.log(`✅ Loaded ${events.length} events from Ticketmaster`);
    console.log('🎯 First event sample:', events[0]);
    
    const transformed = transformEvents(events);
    console.log('✨ Transformed events count:', transformed.length);
    console.log('✨ First transformed event:', transformed[0]);
    
    return transformed;
  } catch (error) {
    console.error('❌ Error fetching Ticketmaster events:', error);
    console.error('❌ Error stack:', error.stack);
    return [];
  }
};

/**
 * Search events by keyword
 */
export const searchEvents = async (keyword, params = {}) => {
  return getEvents({ keyword, ...params });
};

/**
 * Get events by location
 */
export const getEventsByCity = async (city, countryCode = 'US', params = {}) => {
  return getEvents({ city, countryCode, ...params });
};

/**
 * Get events near coordinates
 */
export const getEventsNearby = async (lat, lng, radius = 50, params = {}) => {
  return getEvents({ 
    latlong: `${lat},${lng}`,
    radius,
    unit: 'miles',
    ...params 
  });
};

/**
 * Get event by ID
 */
export const getEventById = async (eventId) => {
  if (!API_KEY) {
    console.error('❌ Ticketmaster API key not found');
    return null;
  }

  try {
    const url = `${BASE_URL}events/${eventId}.json?apikey=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Event not found: ${response.status}`);
    }

    const event = await response.json();
    return transformEvent(event);
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    return null;
  }
};

/**
 * Get attractions (artists/performers)
 */
export const getAttractions = async (keyword, params = {}) => {
  if (!API_KEY) {
    console.error('❌ Ticketmaster API key not found');
    return [];
  }

  try {
    const queryParams = new URLSearchParams({
      apikey: API_KEY,
      keyword,
      size: params.size || 50,
      ...params
    });

    const url = `${BASE_URL}attractions.json?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }

    const data = await response.json();
    return data._embedded?.attractions || [];
  } catch (error) {
    console.error('❌ Error fetching attractions:', error);
    return [];
  }
};

/**
 * Transform Ticketmaster event to our app format
 */
function transformEvent(event) {
  const venue = event._embedded?.venues?.[0];
  const attraction = event._embedded?.attractions?.[0];
  const priceRanges = event.priceRanges?.[0];
  const images = event.images || [];
  
  // Get best quality image
  const getBestImage = () => {
    const sorted = [...images].sort((a, b) => (b.width || 0) - (a.width || 0));
    return sorted[0]?.url || '/placeholder.jpg';
  };

  return {
    id: event.id,
    name: event.name,
    artist: attraction?.name || event.name,
    artistImage: attraction?.images?.[0]?.url || getBestImage(),
    date: event.dates?.start?.localDate || 'TBA',
    time: event.dates?.start?.localTime || 'TBA',
    venue: venue?.name || 'TBA',
    city: venue?.city?.name || 'Unknown',
    state: venue?.state?.name || venue?.state?.stateCode || '',
    country: venue?.country?.name || venue?.country?.countryCode || 'Unknown',
    lat: parseFloat(venue?.location?.latitude) || 0,
    lng: parseFloat(venue?.location?.longitude) || 0,
    continent: getContinent(venue?.country?.countryCode),
    price: priceRanges ? `$${priceRanges.min} - $${priceRanges.max}` : 'N/A',
    priceMin: priceRanges?.min || 0,
    priceMax: priceRanges?.max || 0,
    currency: priceRanges?.currency || 'USD',
    image: getBestImage(),
    url: event.url,
    ticketLimit: event.ticketLimit?.info || null,
    seatmap: event.seatmap?.staticUrl || null,
    status: event.dates?.status?.code || 'onsale',
    genre: event.classifications?.[0]?.genre?.name || 'Music',
    subGenre: event.classifications?.[0]?.subGenre?.name || '',
    type: event.type || 'event',
    description: event.info || event.pleaseNote || '',
    ageRestrictions: event.ageRestrictions?.legalAgeEnforced ? 'Age restrictions apply' : null,
    accessibility: event.accessibility?.info || null,
    promoter: event.promoter?.name || null,
  };
}

/**
 * Transform multiple events
 */
function transformEvents(events) {
  return events.map(transformEvent).filter(event => 
    event.lat !== 0 && event.lng !== 0 // Filter out events without valid coordinates
  );
}

/**
 * Get continent from country code
 */
function getContinent(countryCode) {
  const continentMap = {
    // North America
    US: 'North America', CA: 'North America', MX: 'North America',
    // Europe
    GB: 'Europe', FR: 'Europe', DE: 'Europe', IT: 'Europe', ES: 'Europe',
    NL: 'Europe', BE: 'Europe', CH: 'Europe', AT: 'Europe', SE: 'Europe',
    NO: 'Europe', DK: 'Europe', FI: 'Europe', IE: 'Europe', PT: 'Europe',
    PL: 'Europe', CZ: 'Europe', GR: 'Europe', HU: 'Europe', RO: 'Europe',
    // Asia
    JP: 'Asia', CN: 'Asia', IN: 'Asia', KR: 'Asia', TH: 'Asia',
    SG: 'Asia', MY: 'Asia', PH: 'Asia', ID: 'Asia', VN: 'Asia',
    // Oceania
    AU: 'Oceania', NZ: 'Oceania',
    // South America
    BR: 'South America', AR: 'South America', CL: 'South America',
    CO: 'South America', PE: 'South America',
    // Africa
    ZA: 'Africa', EG: 'Africa', NG: 'Africa', KE: 'Africa',
  };

  return continentMap[countryCode] || 'Unknown';
}
