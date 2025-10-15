import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundParticles from '../components/BackgroundParticles';
import { AppContext } from '../context/AppContext';
import '../styles/profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { 
    user, 
    followingArtists = [], 
    liked = [],
    planned = [],
    toggleFollowArtist 
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: user?.name || 'Music Lover',
    email: user?.email || 'user@example.com',
    location: 'San Francisco, CA',
    bio: 'Passionate about live music and discovering new artists.',
    joinedDate: '2024-01-15',
    avatar: user?.avatar || null,
    preferences: {
      genres: ['Rock', 'Electronic', 'Jazz'],
      notifications: true,
      publicProfile: true,
      emailUpdates: true
    }
  });

  const stats = useMemo(() => ({
    following: followingArtists.length,
    liked: liked.length,
    planned: planned.length,
    eventsAttended: 12 // Would come from backend
  }), [followingArtists, liked, planned]);

  const upcomingEvents = useMemo(() => {
    return planned
      .filter(p => p.event && new Date(p.event.date) > new Date())
      .sort((a, b) => new Date(a.event.date) - new Date(b.event.date))
      .slice(0, 5);
  }, [planned]);

  const handleSaveProfile = () => {
    // In production, this would save to backend
    setEditMode(false);
    // Mock notification
    console.log('Profile saved:', userProfile);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="page-root page-profile">
      <BackgroundParticles id="profile-bg" />

      {/* Profile Hero Section */}
      <div className="profile-hero">
        <div className="profile-hero-bg"></div>
        <div className="profile-hero-content">
          <div className="profile-avatar-wrapper">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar profile-avatar-placeholder">
                {getInitials(userProfile.name)}
              </div>
            )}
            {editMode && (
              <button className="avatar-edit-btn" title="Change avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            )}
          </div>
          <div className="profile-header-info">
            {editMode ? (
              <input 
                type="text" 
                value={userProfile.name} 
                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                className="profile-name-input"
              />
            ) : (
              <h1 className="profile-name">{userProfile.name}</h1>
            )}
            <p className="profile-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {editMode ? (
                <input 
                  type="text" 
                  value={userProfile.location} 
                  onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                  className="profile-location-input"
                />
              ) : (
                userProfile.location
              )}
            </p>
            <p className="profile-joined">
              Member since {new Date(userProfile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="profile-actions">
            {editMode ? (
              <>
                <button className="btn btn-primary" onClick={handleSaveProfile}>Save</button>
                <button className="btn" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="profile-stats">
          <div className="stat-card" onClick={() => setActiveTab('artists')}>
            <div className="stat-value">{stats.following}</div>
            <div className="stat-label">Following</div>
          </div>
          <div className="stat-card" onClick={() => setActiveTab('liked')}>
            <div className="stat-value">{stats.liked}</div>
            <div className="stat-label">Liked Events</div>
          </div>
          <div className="stat-card" onClick={() => setActiveTab('plans')}>
            <div className="stat-value">{stats.planned}</div>
            <div className="stat-label">Planned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.eventsAttended}</div>
            <div className="stat-label">Attended</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`}
          onClick={() => setActiveTab('artists')}
        >
          Following
        </button>
        <button 
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          My Plans
        </button>
        <button 
          className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          Liked
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="container-medium profile-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="profile-tab-content">
            <div className="profile-grid">
              {/* About Section */}
              <div className="profile-card">
                <h3 className="card-title">About</h3>
                {editMode ? (
                  <textarea 
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                    className="profile-bio-input"
                    rows={4}
                  />
                ) : (
                  <p className="profile-bio">{userProfile.bio}</p>
                )}
              </div>

              {/* Upcoming Events */}
              <div className="profile-card">
                <h3 className="card-title">Upcoming Events</h3>
                {upcomingEvents.length > 0 ? (
                  <div className="upcoming-events-list">
                    {upcomingEvents.map((plan, idx) => (
                      <div key={idx} className="upcoming-event-item" onClick={() => navigate(`/plan/${plan.serverId || plan.id}`)}>
                        <div className="event-date">
                          <div className="event-month">{new Date(plan.event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                          <div className="event-day">{new Date(plan.event.date).getDate()}</div>
                        </div>
                        <div className="event-info">
                          <div className="event-name">{plan.event.title}</div>
                          <div className="event-location">{plan.event.location}</div>
                        </div>
                        <svg className="event-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No upcoming events planned yet.</p>
                )}
              </div>

              {/* Music Preferences */}
              <div className="profile-card">
                <h3 className="card-title">Music Preferences</h3>
                <div className="genre-tags">
                  {userProfile.preferences.genres.map((genre, idx) => (
                    <span key={idx} className="genre-tag">{genre}</span>
                  ))}
                  {editMode && (
                    <button className="genre-tag genre-tag-add">+ Add Genre</button>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="profile-card">
                <h3 className="card-title">Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon activity-icon-follow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <line x1="19" y1="8" x2="19" y2="14"></line>
                        <line x1="22" y1="11" x2="16" y2="11"></line>
                      </svg>
                    </div>
                    <div className="activity-text">
                      Followed <strong>{followingArtists[0]?.name || 'an artist'}</strong>
                    </div>
                    <div className="activity-time">2h ago</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon activity-icon-like">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </div>
                    <div className="activity-text">
                      Liked an event
                    </div>
                    <div className="activity-time">5h ago</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon activity-icon-plan">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div className="activity-text">
                      Created a new plan
                    </div>
                    <div className="activity-time">1d ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Following Artists Tab */}
        {activeTab === 'artists' && (
          <div className="profile-tab-content">
            <div className="section-header">
              <h2>Following ({followingArtists.length})</h2>
            </div>
            {followingArtists.length > 0 ? (
              <div className="artists-grid-profile">
                {followingArtists.map(artist => (
                  <div key={artist.id} className="artist-card-profile" onClick={() => navigate(`/artists/${artist.id}`)}>
                    <img src={artist.image || '/logo.png'} alt={artist.name} className="artist-img" />
                    <div className="artist-info">
                      <div className="artist-name">{artist.name}</div>
                      <div className="artist-genre">{artist.genre}</div>
                      <div className="artist-followers">{(artist.followers || 0).toLocaleString()} followers</div>
                    </div>
                    <button 
                      className="btn btn-sm unfollow-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollowArtist(artist);
                      }}
                    >
                      Unfollow
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3>No Artists Yet</h3>
                <p>Start following artists to see them here</p>
                <button className="btn btn-primary" onClick={() => navigate('/artists')}>Explore Artists</button>
              </div>
            )}
          </div>
        )}

        {/* My Plans Tab */}
        {activeTab === 'plans' && (
          <div className="profile-tab-content">
            <div className="section-header">
              <h2>My Plans ({planned.length})</h2>
              <button className="btn btn-primary" onClick={() => navigate('/events')}>Create New Plan</button>
            </div>
            {planned.length > 0 ? (
              <div className="plans-list">
                {planned.map((plan, idx) => (
                  <div key={idx} className="plan-card-profile" onClick={() => navigate(`/plan/${plan.serverId || plan.id}`)}>
                    <div className="plan-header">
                      <h4>{plan.event?.title || 'Event'}</h4>
                      <span className="plan-badge">{plan.status || 'Planned'}</span>
                    </div>
                    <div className="plan-details">
                      <div className="plan-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {plan.event?.date ? new Date(plan.event.date).toLocaleDateString() : 'Date TBD'}
                      </div>
                      <div className="plan-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {plan.event?.location || 'Location TBD'}
                      </div>
                      <div className="plan-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        {plan.numPeople || 1} {plan.numPeople === 1 ? 'person' : 'people'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h3>No Plans Yet</h3>
                <p>Create your first event plan</p>
                <button className="btn btn-primary" onClick={() => navigate('/events')}>Browse Events</button>
              </div>
            )}
          </div>
        )}

        {/* Liked Tab */}
        {activeTab === 'liked' && (
          <div className="profile-tab-content">
            <div className="section-header">
              <h2>Liked Events ({liked.length})</h2>
            </div>
            {liked.length > 0 ? (
              <div className="liked-grid">
                {liked.map((eventId, idx) => (
                  <div key={idx} className="liked-card" onClick={() => navigate(`/events`)}>
                    <div className="liked-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </div>
                    <div className="liked-info">Event #{idx + 1}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <h3>No Liked Events</h3>
                <p>Start liking events to save them here</p>
                <button className="btn btn-primary" onClick={() => navigate('/events')}>Browse Events</button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="profile-tab-content">
            <div className="settings-grid">
              <div className="profile-card">
                <h3 className="card-title">Account Settings</h3>
                <div className="settings-group">
                  <div className="setting-item">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      className="setting-input"
                    />
                  </div>
                  <div className="setting-item">
                    <label>Password</label>
                    <button className="btn">Change Password</button>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h3 className="card-title">Preferences</h3>
                <div className="settings-group">
                  <div className="setting-toggle">
                    <div className="setting-toggle-info">
                      <div className="setting-toggle-label">Email Notifications</div>
                      <div className="setting-toggle-desc">Receive updates about events and artists</div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences.emailUpdates}
                        onChange={(e) => setUserProfile({
                          ...userProfile, 
                          preferences: {...userProfile.preferences, emailUpdates: e.target.checked}
                        })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-toggle">
                    <div className="setting-toggle-info">
                      <div className="setting-toggle-label">Public Profile</div>
                      <div className="setting-toggle-desc">Make your profile visible to others</div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences.publicProfile}
                        onChange={(e) => setUserProfile({
                          ...userProfile, 
                          preferences: {...userProfile.preferences, publicProfile: e.target.checked}
                        })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-toggle">
                    <div className="setting-toggle-info">
                      <div className="setting-toggle-label">Push Notifications</div>
                      <div className="setting-toggle-desc">Get notified about new events near you</div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={userProfile.preferences.notifications}
                        onChange={(e) => setUserProfile({
                          ...userProfile, 
                          preferences: {...userProfile.preferences, notifications: e.target.checked}
                        })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h3 className="card-title">Privacy & Data</h3>
                <div className="settings-group">
                  <button className="btn">Download My Data</button>
                  <button className="btn">Privacy Settings</button>
                  <button className="btn btn-danger">Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
