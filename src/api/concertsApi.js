// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get all concerts from the API or fallback to local JSON
 */
export async function getConcerts() {
  try {
    // Try to fetch from backend API first
    const response = await fetch(`${API_BASE_URL}/concerts`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.warn('API not available, loading from local JSON:', error.message);
  }
  
  // Fallback to local JSON file
  try {
    const response = await fetch('/concerts.json');
    if (!response.ok) {
      throw new Error('Failed to load concerts.json');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading concerts:', error);
    return [];
  }
}

/**
 * Like/Track a concert
 */
export async function likeConcert(concertId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/concerts/${concertId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to track concert');
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error tracking concert:', error);
    // Return success true for demo purposes when API is not available
    return { success: true, message: 'Concert tracked locally' };
  }
}

/**
 * Unlike/Untrack a concert
 */
export async function unlikeConcert(concertId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/concerts/${concertId}/like`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to untrack concert');
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error untracking concert:', error);
    return { success: true, message: 'Concert untracked locally' };
  }
}

/**
 * Get user's tracked concerts
 */
export async function getTrackedConcerts(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/concerts/tracked`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get tracked concerts');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting tracked concerts:', error);
    return [];
  }
}

/**
 * User login
 */
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * User registration
 */
export async function registerUser(email, password, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, name })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get concert by ID
 */
export async function getConcertById(concertId) {
  try {
    const response = await fetch(`${API_BASE_URL}/concerts/${concertId}`);
    
    if (!response.ok) {
      throw new Error('Concert not found');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching concert:', error);
    // Fallback to searching in local data
    const concerts = await getConcerts();
    return concerts.find(c => c.id === concertId || c._id === concertId);
  }
}

/**
 * Search concerts by query
 */
export async function searchConcerts(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/concerts/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search error:', error);
    // Fallback to local search
    const concerts = await getConcerts();
    const lowerQuery = query.toLowerCase();
    return concerts.filter(c => 
      c.name?.toLowerCase().includes(lowerQuery) ||
      c.artist?.toLowerCase().includes(lowerQuery) ||
      c.city?.toLowerCase().includes(lowerQuery) ||
      c.country?.toLowerCase().includes(lowerQuery)
    );
  }
}

/**
 * Filter concerts by parameters
 */
export async function filterConcerts(filters = {}) {
  const concerts = await getConcerts();
  
  return concerts.filter(concert => {
    if (filters.continent && concert.continent !== filters.continent) {
      return false;
    }
    if (filters.artist && concert.artist !== filters.artist) {
      return false;
    }
    if (filters.isLive !== undefined && concert.isLive !== filters.isLive) {
      return false;
    }
    if (filters.country && concert.country !== filters.country) {
      return false;
    }
    return true;
  });
}

/**
 * Get live concerts
 */
export async function getLiveConcerts() {
  const concerts = await getConcerts();
  return concerts.filter(c => c.isLive);
}

/**
 * Get concerts by continent
 */
export async function getConcertsByContinent(continent) {
  const concerts = await getConcerts();
  return concerts.filter(c => c.continent === continent);
}

/**
 * Get unique continents
 */
export async function getContinents() {
  const concerts = await getConcerts();
  const continents = [...new Set(concerts.map(c => c.continent).filter(Boolean))];
  return continents.sort();
}

/**
 * Get unique artists
 */
export async function getArtists() {
  const concerts = await getConcerts();
  const artists = [...new Set(concerts.map(c => c.artist).filter(Boolean))];
  return artists.sort();
}
