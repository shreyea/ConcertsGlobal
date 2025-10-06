import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ArtistCard from '../components/ArtistCard';

export default function Following() {
  const { followingArtists, toggleFollowArtist } = useContext(AppContext);

  return (
    <div className="page-root page-following" style={{ padding: 24 }}>
      <div className="container-medium">
        <h2>Your Following</h2>
        {(!followingArtists || followingArtists.length === 0) ? (
          <div className="muted">You aren't following any artists yet.</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
            {(followingArtists || []).map(a => (
              <ArtistCard key={a.id} artist={a} onFollowToggle={() => toggleFollowArtist(a)} isFollowing={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
