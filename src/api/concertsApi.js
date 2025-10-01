



// Hardcoded concert data for development
const HARDCODED_CONCERTS = [
  {
    id: 1,
    artist: "Coldplay",
    venue: "Wembley Stadium",
    city: "London",
    country: "UK",
    latitude: 51.556,
    longitude: -0.279,
    date: "2025-07-15",
    genre: "Rock",
    ticket_url: "https://ticketmaster.com/..."
  },
  {
    id: 2,
    artist: "BTS",
    venue: "Seoul Olympic Stadium",
    city: "Seoul",
    country: "South Korea",
    latitude: 37.515,
    longitude: 127.073,
    date: "2025-08-01",
    genre: "K-pop",
    ticket_url: "https://interpark.com/..."
  }
];

export async function getConcerts() {
  return HARDCODED_CONCERTS;
}








