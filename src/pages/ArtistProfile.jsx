import React, { useEffect, useMemo, useState, useContext } from 'react';
import BackgroundParticles from '../components/BackgroundParticles';
import { useLocation, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import * as artistsData from '../../server/artistsData';

function demoShows() {
  return Array.from({length:6}).map((_,i)=>({ id: `show-${i}`, venue: ['MSG','The Forum','Royal Albert Hall'][i%3], date: new Date(Date.now() + (i-2)*86400000*30).toISOString(), city: ['NY','LA','LDN'][i%3], rating: Math.round(Math.random()*5*10)/10 }));
}

export default function ArtistProfile(){
  const loc = useLocation();
  const params = useParams();
  // Resolve artist either from navigation state or from server data by id
  const resolvedFromServer = (artistsData.artists || []).find(a => String(a.id) === String(params.id));
  const artist = loc.state?.artist || (resolvedFromServer ? {
    id: String(resolvedFromServer.id),
    name: resolvedFromServer.name,
    bio: resolvedFromServer.description || resolvedFromServer.bio || '',
    image: resolvedFromServer.image || '/logo.png',
    genre: resolvedFromServer.genre || '',
    followers: resolvedFromServer.followers || 0,
    city: resolvedFromServer.city || ''
  } : { id: params.id, name: 'Unknown Artist', bio: 'No bio available', image: '/logo.png', genre: 'Unknown', followers: 12345 });
  const [tab, setTab] = useState('overview');
  const { followingArtists, toggleFollowArtist } = useContext(AppContext);
  const isFollowing = (followingArtists || []).some(a => a.id === artist.id);
  const [shows, setShows] = useState([]);
  const [localFollowers, setLocalFollowers] = useState(artist.followers || 0);

  useEffect(()=>{ setShows(demoShows()); }, []);

  const upcoming = useMemo(()=> shows.filter(s=> new Date(s.date) > new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date)), [shows]);
  const past = useMemo(()=> shows.filter(s=> new Date(s.date) <= new Date()).sort((a,b)=>new Date(b.date)-new Date(a.date)), [shows]);

  return (
    <div className="page-root page-artist" style={{ padding: 24 }}>
      <BackgroundParticles id="artist-profile-bg" />
      <div className="container-medium">
        <div className="artist-hero plan-card" style={{ display:'flex', gap:16, alignItems:'center' }}>
          <img src={artist.image} alt={artist.name} style={{ width:120, height:120, borderRadius: 100, objectFit:'cover' }} />
          <div>
            <h2 style={{ margin:0 }}>{artist.name}</h2>
            <div className="muted">{artist.genre} • {artist.city || ''}</div>
            <div style={{ marginTop:8 }}>
              <button className={`btn ${isFollowing ? 'btn-primary' : ''}`} onClick={() => {
                // optimistic update for follower count
                setLocalFollowers(f => Math.max(0, f + (isFollowing ? -1 : 1)));
                toggleFollowArtist && toggleFollowArtist(artist);
              }}>{isFollowing ? 'Following' : 'Follow'}</button>
            </div>
            <div style={{ marginTop:8 }} className="muted">{localFollowers.toLocaleString()} followers • {shows.length} shows</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display:'flex', gap:8 }}>
            <button className={`btn ${tab==='overview'?'btn-primary':''}`} onClick={()=>setTab('overview')}>Overview</button>
            <button className={`btn ${tab==='shows'?'btn-primary':''}`} onClick={()=>setTab('shows')}>Shows</button>
            <button className={`btn ${tab==='media'?'btn-primary':''}`} onClick={()=>setTab('media')}>Media</button>
            <button className={`btn ${tab==='fans'?'btn-primary':''}`} onClick={()=>setTab('fans')}>Fans</button>
          </div>

          <div style={{ marginTop: 12 }}>
            {tab === 'overview' && (
              <div className="plan-card">
                <h3>About</h3>
                <p className="muted">{artist.bio}</p>
                <h4>Stats</h4>
                <div style={{ display:'flex', gap:12 }}>
                  <div className="plan-card" style={{ padding:8 }}>Followers<br/><strong>{localFollowers.toLocaleString()}</strong></div>
                  <div className="plan-card" style={{ padding:8 }}>Shows<br/><strong>{shows.length}</strong></div>
                  <div className="plan-card" style={{ padding:8 }}>Avg Rating<br/><strong>{(shows.reduce((s,a)=>s+a.rating,0)/Math.max(1,shows.length)).toFixed(1)}</strong></div>
                </div>
              </div>
            )}

            {tab === 'shows' && (
              <div className="plan-card">
                <h3>Shows</h3>
                <h4>Upcoming</h4>
                {upcoming.map(s=> <div key={s.id} className="muted">{new Date(s.date).toLocaleDateString()} • {s.venue} • {s.city}</div>)}
                <hr />
                <h4>Past</h4>
                {past.map(s=> <div key={s.id} className="muted">{new Date(s.date).toLocaleDateString()} • {s.venue} • {s.city} • Rating: {s.rating}</div>)}
              </div>
            )}

            {tab === 'media' && (
              <div className="plan-card">
                <h3>Media</h3>
                <div className="muted">Embedded Spotify / YouTube would appear here (requires API integration)</div>
              </div>
            )}

            {tab === 'fans' && (
              <div className="plan-card">
                <h3>Fans</h3>
                <div className="muted">Fan comments and recent followers will be shown here (placeholder).</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
