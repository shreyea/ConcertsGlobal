import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import BackgroundParticles from '../components/BackgroundParticles';
import '../styles/artists.css';
import TopPicksCarousel from '../components/TopPicksCarousel';
import ArtistCard from '../components/ArtistCard';
import { AppContext } from '../context/AppContext';
import * as artistsData from '../../server/artistsData';

export default function Artists() {
  const { followingArtists = [], toggleFollowArtist } = useContext(AppContext);

  const [artists, setArtists] = useState([]);
  const [featuredLocal, setFeaturedLocal] = useState(null);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [country, setCountry] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all | top | new | trending
  const [viewMode, setViewMode] = useState('grid'); // grid | list | compact
  const [sortMode, setSortMode] = useState('most_followed');
  const [showOnlyTopPicks, setShowOnlyTopPicks] = useState(false);

  // Following dropdown on the page
  const [openFollowing, setOpenFollowing] = useState(false);
  const followingRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Use server-provided artists data (static file in this repo). In production this
    // would be replaced with an API fetch.
  setArtists(((artistsData.artists) || []).map(a => ({
      // normalize shape expected by the page
      id: (a.id || a.name).toString(),
      name: a.name,
      image: a.image || '/logo.png',
      genre: a.genre || '',
      country: a.country || '',
      followers: a.followers || 0,
      latestShow: a.latestShow || a.latestShow || a.nextEvent || null,
      bio: a.description || a.bio || ''
    })));
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (!followingRef.current) return;
      if (!followingRef.current.contains(e.target)) setOpenFollowing(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // Prefer featuredArtists for hero/top picks when available
  const topPicks = useMemo(() => {
    if (artistsData.featuredArtists && artistsData.featuredArtists.length) {
      return (artistsData.featuredArtists || []).map(a => ({
        id: (a.id || a.name).toString(),
        name: a.name,
        // normalize banner/image; if image file isn't present, fallback to /logo.png
        image: (a.banner || a.image) ? (a.banner || a.image) : '/logo.png',
        genre: a.genre,
        country: a.country,
        followers: a.followers || 0,
        latestShow: a.nextEvent || a.latestShow || null,
        bio: a.description || ''
      }));
    }
    return artists.slice(0, 6).sort((a, b) => b.followers - a.followers);
  }, [artists]);

  // initialize a local copy of featured/top picks so we can optimistically update follower counts
  useEffect(() => {
    if (!featuredLocal) {
      setFeaturedLocal(topPicks && topPicks.length ? topPicks.slice(0, 6) : null);
    }
  // intentionally only run when topPicks changes initially
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topPicks]);

  const filtered = useMemo(() => {
    return artists.filter(a => {
      if (query && !a.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (genre && a.genre !== genre) return false;
      if (country && a.country !== country) return false;
      if (filterMode === 'top' && a.followers < 50000) return false;
      return true;
    });
  }, [artists, query, genre, country, filterMode]);

  const sortedFiltered = useMemo(() => {
    const copy = [...filtered];
    if (sortMode === 'most_followed') return copy.sort((a, b) => b.followers - a.followers);
    if (sortMode === 'recent') return copy.sort((a, b) => (b.id || '').localeCompare(a.id));
    if (sortMode === 'performing_soon') return copy.sort((a, b) => {
      const ad = new Date(a.latestShow?.date || 0).getTime();
      const bd = new Date(b.latestShow?.date || 0).getTime();
      return (ad || 0) - (bd || 0);
    });
    return copy;
  }, [filtered, sortMode]);

  function handleFollowToggle(artistId) {
    const artistObj = artists.find(a => a.id === artistId) || topPicks.find(a => a.id === artistId) || { id: artistId };
    if (!toggleFollowArtist) return;
    // Optimistic UI: update local artists and featured list follower counts immediately
    const isFollowing = (followingArtists || []).some(a => String(a.id) === String(artistId));
    setArtists(prev => prev.map(a => {
      if (String(a.id) !== String(artistId)) return a;
      return { ...a, followers: Math.max(0, (a.followers || 0) + (isFollowing ? -1 : 1)) };
    }));
    if (featuredLocal) {
      setFeaturedLocal(prev => prev ? prev.map(a => {
        if (String(a.id) !== String(artistId)) return a;
        return { ...a, followers: Math.max(0, (a.followers || 0) + (isFollowing ? -1 : 1)) };
      }) : prev);
    }

    toggleFollowArtist(artistObj);
  }

  const itemsToShow = showOnlyTopPicks ? topPicks : sortedFiltered;

  return (
    <div className="page-root page-artists">
      <BackgroundParticles id="artists-bg" />
      

      {/* Enhanced hero section with gradient overlay and dynamic content */}
      <div className="artists-hero-full" style={{ position: 'relative' }}>
        {(topPicks || []).length > 0 ? <TopPicksCarousel items={topPicks} autoPlay interval={4500} /> : null}
        
       {/* Overlayed hero controls: positioned in top right corner */}
        <div className="artists-hero-controls">
          <div className="hero-search-wrap">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input  value={query} onChange={(e) => setQuery(e.target.value)} className="plan-input hero-search" />
          </div>
          <div className="hero-filter-wrap">
            <button className="btn btn-ghost hero-filter-btn" onClick={() => setShowFilters(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Gradient overlay for better text contrast */}
        <div className="hero-gradient-overlay"></div>

        
      

       

        {/* Right-side Filters panel popup (overlaps content) */}
        {showFilters && (
          <div className="filters-panel-backdrop" onClick={() => setShowFilters(false)}>
            <aside className="filters-panel-right" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 style={{ margin: 0 }}>Filters</h3>
                <button className="btn" onClick={() => setShowFilters(false)} aria-label="Close filters">✕</button>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <label className="muted">Genre</label>
                <select value={genre} onChange={e => setGenre(e.target.value)} className="plan-input">
                  <option value="">All genres</option>
                  {(artistsData.filters?.genres || []).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <label className="muted">Country</label>
                <select value={country} onChange={e => setCountry(e.target.value)} className="plan-input">
                  <option value="">All countries</option>
                  {(artistsData.filters?.countries || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label className="muted">Mode</label>
                  <select value={filterMode} onChange={e => setFilterMode(e.target.value)} className="plan-input">
                    <option value="all">All</option>
                    <option value="top">Top</option>
                    <option value="new">New</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label className="muted">Sort</label>
                  <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="plan-input">
                    <option value="most_followed">Most Followed</option>
                    <option value="recent">Recently Added</option>
                    <option value="performing_soon">Performing Soon</option>
                  </select>
                </div>

                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={showOnlyTopPicks} onChange={e => setShowOnlyTopPicks(e.target.checked)} />
                  <span className="muted">Show only Top Picks</span>
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                  <button className="btn" onClick={() => { setGenre(''); setCountry(''); setFilterMode('all'); setSortMode('most_followed'); setShowOnlyTopPicks(false); setShowFilters(false); }}>Clear</button>
                  <button className="btn btn-primary" onClick={() => setShowFilters(false)}>Apply</button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      <div className="container-medium">
        {/* Stats bar with visual interest */}
        <div className="artists-stats-bar">
          <div className="stat-item">
            <div className="stat-value">{artists.length}</div>
            <div className="stat-label">Artists</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">{(topPicks || []).length}</div>
            <div className="stat-label">Featured</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">{itemsToShow.length}</div>
            <div className="stat-label">Showing</div>
          </div>
        </div>

        {/* View & Sort controls with better spacing */}
        <div className="artists-controls-bar">
          <div className="view-mode-switcher">
            <span className="control-label">View</span>
            <div className="btn-group">
              <button className={`btn btn-icon ${viewMode === 'grid' ? 'btn-primary' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button className={`btn btn-icon ${viewMode === 'list' ? 'btn-primary' : ''}`} onClick={() => setViewMode('list')} title="List view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
              <button className={`btn btn-icon ${viewMode === 'compact' ? 'btn-primary' : ''}`} onClick={() => setViewMode('compact')} title="Compact view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
            </div>
          </div>
          <div className="sort-controls">
            <span className="control-label">Sort by</span>
            <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="plan-input sort-select">
              <option value="most_followed">Most Followed</option>
              <option value="recent">Recently Added</option>
              <option value="performing_soon">Performing Soon</option>
            </select>
          </div>
        </div>

        {/* Main content */}
        {viewMode === 'grid' && (
          <div className="artists-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {(itemsToShow).map(a => (
              <ArtistCard key={a.id} artist={a} onFollowToggle={() => handleFollowToggle(a.id)} isFollowing={(followingArtists || []).some(x => x.id === a.id)} />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="artists-list">
            {(itemsToShow).map(a => (
              <div key={a.id} className="artist-list-item plan-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={a.image} alt={a.name} style={{ width: 88, height: 88, borderRadius: 88, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{a.name}</div>
                        <div className="muted">{a.genre} • {a.country}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="muted">Followed by {a.followers.toLocaleString()}</div>
                        <button className="btn" onClick={() => handleFollowToggle(a.id)}>{(followingArtists || []).some(x => x.id === a.id) ? 'Following' : 'Follow'}</button>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }} className="muted">{a.bio}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'compact' && (
          <div className="artists-grid compact" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {(itemsToShow).map(a => (
              <div key={a.id} className="artist-compact plan-card" style={{ padding: 8 }}>
                <img src={a.image} alt={a.name} style={{ width: 56, height: 56, borderRadius: 999 }} />
                <div style={{ fontWeight: 700, marginTop: 6 }}>{a.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{a.genre}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
