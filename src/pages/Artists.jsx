import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import BackgroundParticles from '../components/BackgroundParticles';
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

      {/* Top black control bar above the hero */}
      <div className="artists-topbar">
        <div className="container-medium artists-topbar-inner">
          <div className="artists-controls-left">
            <input placeholder="Search artists" value={query} onChange={(e) => setQuery(e.target.value)} className="plan-input" />
            <select value={genre} onChange={e => setGenre(e.target.value)} className="plan-input">
              <option value="">All genres</option>
              {(artistsData.filters?.genres || []).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select value={country} onChange={e => setCountry(e.target.value)} className="plan-input">
              <option value="">All countries</option>
              {(artistsData.filters?.countries || []).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="artists-controls-right">
            <button className={`btn ${!showOnlyTopPicks ? 'btn-primary' : ''}`} onClick={() => { setShowOnlyTopPicks(false); setFilterMode('all'); }}>All</button>
            <button className={`btn ${showOnlyTopPicks ? 'btn-primary' : ''}`} onClick={() => { setShowOnlyTopPicks(true); setFilterMode('top'); }}>Top Picks</button>
            <button className={`btn ${filterMode === 'new' ? 'btn-primary' : ''}`} onClick={() => { setShowOnlyTopPicks(false); setFilterMode('new'); }}>New</button>

            <div ref={followingRef} style={{ position: 'relative' }}>
              <button className="btn btn-following" onClick={() => setOpenFollowing(s => !s)}>Following {(followingArtists || []).length ? `(${followingArtists.length})` : ''}</button>
              {openFollowing && (
                <div className="following-dropdown">
                  {(!followingArtists || followingArtists.length === 0) ? (
                    <div className="muted" style={{ padding: 12 }}>No followed artists yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8 }}>
                      {(followingArtists || []).slice(0, 8).map(a => (
                        <div key={a.id} className="following-item" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={a.image || '/logo.png'} alt={a.name} style={{ width: 40, height: 40, borderRadius: 40, objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700 }}>{a.name}</div>
                            <div className="muted" style={{ fontSize: 12 }}>{a.genre}</div>
                          </div>
                          <div>
                            <button className="btn" onClick={() => handleFollowToggle(a.id)}>Unfollow</button>
                          </div>
                        </div>
                      ))}
                      <div style={{ textAlign: 'right', marginTop: 6 }}>
                        <a href="/following" className="muted" onClick={() => setOpenFollowing(false)}>Manage all</a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed hero carousel for featured artists */}
      <div className="artists-hero-full">
        {(topPicks || []).length > 0 ? <TopPicksCarousel items={topPicks} autoPlay interval={4500} /> : null}
      </div>

      <div className="container-medium">
        {/* small header/summary above controls */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Top picks detected: <strong style={{ color: 'var(--text-primary)' }}>{(topPicks || []).length}</strong></div>
        </div>

        {/* View & Sort */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label className="muted">View</label>
            <button className={`btn ${viewMode === 'grid' ? 'btn-primary' : ''}`} onClick={() => setViewMode('grid')}>Grid</button>
            <button className={`btn ${viewMode === 'list' ? 'btn-primary' : ''}`} onClick={() => setViewMode('list')}>List</button>
            <button className={`btn ${viewMode === 'compact' ? 'btn-primary' : ''}`} onClick={() => setViewMode('compact')}>Compact</button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label className="muted">Sort</label>
            <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="plan-input">
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
