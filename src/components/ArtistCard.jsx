import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArtistCard({ artist, onFollowToggle, isFollowing }) {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/artist/${artist.id}`, { state: { artist } });
  };

  return (
    <article className="artist-card minimal-hover">
      <div className="artist-top" onClick={handleOpen} role="button" tabIndex={0}>
        <img className={`artist-avatar ${isFollowing ? 'avatar-following' : ''}`} src={artist.image || '/logo.png'} alt={`${artist.name}`} loading="lazy" />
        <div className="artist-info">
          <div className="artist-name">{artist.name}</div>
          <div className="artist-genre muted">{artist.genre}</div>
          <div className="artist-followers muted">Followed by {Number(artist.followers || 0).toLocaleString()} people</div>
        </div>
      </div>

      <div className="artist-latest muted">Latest: {artist.latestShow?.venue || 'N/A'}{artist.latestShow?.date ? `, ${artist.latestShow?.date}` : ''}{artist.latestShow?.location ? ` • ${artist.latestShow.location}` : ''}</div>

      <div className="artist-actions">
        <button className={`btn ${isFollowing ? 'btn-primary' : ''}`} onClick={(e) => { e.stopPropagation(); onFollowToggle && onFollowToggle(artist.id); }}>
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); handleOpen(); }}>View Profile</button>
      </div>
    </article>
  );
}
