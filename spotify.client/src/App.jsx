import { useState, useEffect } from 'react';

const getAllSongs = async () => {
  try {
    const response = await fetch(`https://api.github.com/repos/surya50502001/Spotify-/contents?v=${Date.now()}`, {
      cache: 'no-cache'
    });
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    const songFiles = data.filter(file => 
      file.name.endsWith('.mp3') || 
      file.name.endsWith('.wav') || 
      file.name.endsWith('.m4a')
    );
    
    return songFiles.map((file, index) => ({
      id: `github-${index}`,
      title: file.name.replace(/\.(mp3|wav|m4a)$/i, '').replace(/[-_]/g, ' '),
      artist: 'Unknown Artist',
      album: 'GitHub Collection',
      duration: '3:00',
      url: file.download_url,
      source: 'github'
    }));
  } catch (error) {
    console.error('Error fetching songs from GitHub:', error);
    return [];
  }
};

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [audio, setAudio] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [volume, setVolume] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  useEffect(() => {
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.body.style.overscrollBehavior = 'auto';
    document.documentElement.style.overscrollBehavior = 'auto';
    
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    getAllSongs()
      .then(songs => {
        setTracks(songs);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading songs:', error);
        setError(error.message);
        setTracks([]);
        setLoading(false);
      });
  }, []);

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);
  const togglePlay = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const playTrack = (track) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    }
    
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    setCurrentTrackIndex(trackIndex);
    
    const newAudio = new Audio(track.url);
    newAudio.volume = volume;
    newAudio.addEventListener('loadeddata', () => {
      newAudio.play();
      setIsPlaying(true);
      setDuration(newAudio.duration);
    });
    newAudio.addEventListener('timeupdate', () => {
      setProgress(newAudio.currentTime);
    });
    newAudio.addEventListener('ended', () => {
      setIsPlaying(false);
      if (repeatMode === 2) {
        playTrack(track);
      } else {
        nextTrack();
      }
    });
    newAudio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    });
    
    setAudio(newAudio);
    setCurrentTrack(track);
    setRecentlyPlayed(prev => [track, ...prev.filter(t => t.id !== track.id)].slice(0, 10));
  };
  
  const nextTrack = () => {
    if (repeatMode === 1 || tracks.length > 1) {
      let nextIndex;
      if (isShuffled) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } else {
        nextIndex = (currentTrackIndex + 1) % tracks.length;
      }
      if (tracks[nextIndex]) {
        playTrack(tracks[nextIndex]);
      }
    }
  };
  
  const prevTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    if (tracks[prevIndex]) {
      playTrack(tracks[prevIndex]);
    }
  };

  const seekTo = (e) => {
    if (audio && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const theme = {
    bg: isDarkTheme ? '#121212' : '#ffffff',
    sidebar: isDarkTheme ? '#000000' : '#f8f9fa',
    card: isDarkTheme ? '#181818' : '#ffffff',
    text: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#b3b3b3' : '#6c757d',
    border: isDarkTheme ? '#282828' : '#dee2e6'
  };

  const getTrackColor = (index) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24', '#0abde3', '#3867d6', '#8854d0'];
    return colors[index % colors.length];
  };

  const ItachiLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" style={{marginRight: '8px'}}>
      <defs>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Head outline */}
      <path d="M50 15 C35 15 25 25 25 40 C25 50 30 60 35 65 L35 75 C35 80 40 85 50 85 C60 85 65 80 65 75 L65 65 C70 60 75 50 75 40 C75 25 65 15 50 15 Z" 
            fill="none" 
            stroke="#00ffff" 
            strokeWidth="1.5" 
            filter="url(#neonGlow)"/>
      
      {/* Hair spikes */}
      <path d="M35 20 L30 10 M45 18 L42 8 M55 18 L58 8 M65 20 L70 10" 
            stroke="#00ffff" 
            strokeWidth="1" 
            fill="none" 
            filter="url(#neonGlow)"/>
      
      {/* Headphones */}
      <circle cx="25" cy="40" r="8" 
              fill="none" 
              stroke="#ff0080" 
              strokeWidth="2" 
              filter="url(#neonGlow)"/>
      <circle cx="75" cy="40" r="8" 
              fill="none" 
              stroke="#ff0080" 
              strokeWidth="2" 
              filter="url(#neonGlow)"/>
      
      {/* Headphone band */}
      <path d="M33 35 Q50 25 67 35" 
            fill="none" 
            stroke="#ff0080" 
            strokeWidth="2" 
            filter="url(#neonGlow)"/>
      
      {/* Eyes (Sharingan style) */}
      <circle cx="42" cy="38" r="2" fill="#ff0000" opacity="0.8"/>
      <circle cx="58" cy="38" r="2" fill="#ff0000" opacity="0.8"/>
      
      {/* Nose line */}
      <line x1="50" y1="42" x2="50" y2="48" 
            stroke="#00ffff" 
            strokeWidth="0.5" 
            opacity="0.6"/>
    </svg>
  );

  const Sidebar = () => (
    <div style={{
      width: '240px',
      background: theme.sidebar,
      padding: '24px 16px',
      borderRight: `1px solid ${theme.border}`,
      display: window.innerWidth <= 768 && !sidebarOpen ? 'none' : 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: window.innerWidth <= 768 ? 'fixed' : 'static',
      left: window.innerWidth <= 768 ? (sidebarOpen ? '0' : '-240px') : 'auto',
      top: 0,
      height: '100vh',
      zIndex: 1000,
      boxShadow: window.innerWidth <= 768 && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.3)' : 'none'
    }}>
      <div style={{display: 'flex', alignItems: 'center', margin: '0 0 24px 0'}}>
        <ItachiLogo />
        <h2 style={{color: '#1db954', margin: 0, fontSize: '24px', fontWeight: 'bold'}}>GoofyGeekz</h2>
      </div>
      {[
        { name: 'Home', icon: '⌂' },
        { name: 'Search', icon: '⌕' },
        { name: 'Your Library', icon: '♫' },
        { name: 'Recently Played', icon: '⟲' }
      ].map(item => (
        <button key={item.name} onClick={() => setCurrentView(item.name.toLowerCase().replace(' ', ''))} style={{
          background: 'none',
          border: 'none',
          color: currentView === item.name.toLowerCase().replace(' ', '') ? '#1db954' : theme.textSecondary,
          padding: '12px 16px',
          textAlign: 'left',
          cursor: 'pointer',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: currentView === item.name.toLowerCase().replace(' ', '') ? 'bold' : 'normal',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'all 0.2s ease'
        }}>
          <span style={{fontSize: '16px'}}>{item.icon}</span>
          {item.name}
        </button>
      ))}
      <div style={{marginTop: '20px', padding: '16px', background: theme.card, borderRadius: '8px'}}>
        <div style={{color: theme.text, fontSize: '12px', marginBottom: '8px', fontWeight: 'bold'}}>Quick Stats</div>
        <div style={{color: theme.textSecondary, fontSize: '11px'}}>
          <div>♪ Songs: {tracks.length}</div>
          <div>♥ Favorites: {favorites.length}</div>
          <div>⟲ Recent: {recentlyPlayed.length}</div>
        </div>
      </div>
      <button onClick={toggleTheme} style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        color: theme.text,
        padding: '8px 16px',
        borderRadius: '20px',
        cursor: 'pointer',
        marginTop: 'auto',
        fontSize: '12px'
      }}>
        {isDarkTheme ? '☀ Light' : '☽ Dark'}
      </button>
    </div>
  );

  const RecentlyPlayedView = () => (
    <div style={{padding: '24px'}}>
      <h3 style={{color: theme.text, margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold'}}>⟲ Recently Played</h3>
      {recentlyPlayed.length === 0 ? (
        <div style={{color: theme.textSecondary, textAlign: 'center', padding: '40px'}}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>♪</div>
          <div>No recently played songs</div>
        </div>
      ) : (
        recentlyPlayed.map((track, index) => {
          const trackColor = getTrackColor(tracks.findIndex(t => t.id === track.id));
          return (
          <div key={track.id} onClick={() => playTrack(track)} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            background: currentTrack?.id === track.id ? `${trackColor}20` : 'transparent',
            border: `1px solid ${currentTrack?.id === track.id ? trackColor : 'transparent'}`,
            transition: 'all 0.2s ease',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: trackColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {currentTrack?.id === track.id && isPlaying ? '♪' : '♫'}
            </div>
            <div style={{flex: 1, marginLeft: '16px'}}>
              <div style={{color: theme.text, fontSize: '15px', fontWeight: '600'}}>{track.title}</div>
              <div style={{color: theme.textSecondary, fontSize: '12px'}}>{track.artist}</div>
            </div>
          </div>
        );
        })
      )}
    </div>
  );

  const SearchView = () => {
    const filteredTracks = tracks.filter(track => 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return (
      <div style={{padding: '24px'}}>
        <h3 style={{color: theme.text, margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold'}}>⌕ Search Music</h3>
        <input
          type="text"
          placeholder="♪ Search songs, artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: theme.card,
            border: `2px solid ${theme.border}`,
            borderRadius: '25px',
            color: theme.text,
            fontSize: '14px',
            marginBottom: '20px',
            outline: 'none'
          }}
        />
        {filteredTracks.map((track, index) => {
          const trackColor = getTrackColor(index);
          return (
          <div key={track.id} onClick={() => playTrack(track)} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            background: currentTrack?.id === track.id ? `${trackColor}20` : 'transparent',
            border: `1px solid ${currentTrack?.id === track.id ? trackColor : 'transparent'}`,
            transition: 'all 0.2s ease',
            transform: currentTrack?.id === track.id ? 'scale(1.02)' : 'scale(1)',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: currentTrack?.id === track.id ? trackColor : `${trackColor}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {currentTrack?.id === track.id && isPlaying ? '♪' : '▶'}
            </div>
            <div style={{flex: 1, marginLeft: '16px'}}>
              <div style={{color: currentTrack?.id === track.id ? trackColor : theme.text, fontSize: '15px', fontWeight: '600'}}>{track.title}</div>
              <div style={{color: theme.textSecondary, fontSize: '12px'}}>{track.artist}</div>
            </div>
            <div style={{color: theme.textSecondary, fontSize: '12px'}}>{track.duration}</div>
          </div>
        );
        })}
      </div>
    );
  };
  
  const LibraryView = () => {
    const favoriteTracks = tracks.filter(track => favorites.includes(track.id));
    
    return (
      <div style={{padding: '24px'}}>
        <h3 style={{color: theme.text, margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold'}}>♫ Your Library</h3>
        {favoriteTracks.length === 0 ? (
          <div style={{color: theme.textSecondary, textAlign: 'center', padding: '40px'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>♡</div>
            <div>No favorites yet. Start liking some songs!</div>
          </div>
        ) : (
          favoriteTracks.map((track, index) => {
            const trackColor = getTrackColor(tracks.findIndex(t => t.id === track.id));
            return (
            <div key={track.id} onClick={() => playTrack(track)} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              background: currentTrack?.id === track.id ? `${trackColor}20` : 'transparent',
              border: `1px solid ${currentTrack?.id === track.id ? trackColor : 'transparent'}`,
              transition: 'all 0.2s ease',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: trackColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {currentTrack?.id === track.id && isPlaying ? '♪' : '♥'}
              </div>
              <div style={{flex: 1, marginLeft: '16px'}}>
                <div style={{color: currentTrack?.id === track.id ? trackColor : theme.text, fontSize: '15px', fontWeight: '600'}}>{track.title}</div>
                <div style={{color: theme.textSecondary, fontSize: '12px'}}>{track.artist}</div>
              </div>
            </div>
          );
          })
        )}
      </div>
    );
  };
  
  const TrackList = () => (
    <div style={{padding: '24px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h3 style={{color: theme.text, margin: 0, fontSize: '20px', fontWeight: 'bold'}}>♪ All Songs</h3>
        <div style={{display: 'flex', gap: '8px'}}>
          <button onClick={() => setIsShuffled(!isShuffled)} style={{
            background: isShuffled ? '#1db954' : 'transparent',
            border: `1px solid ${isShuffled ? '#1db954' : theme.border}`,
            color: isShuffled ? '#fff' : theme.text,
            padding: '6px 12px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>⚮ Shuffle</button>
          <button onClick={() => setRepeatMode((repeatMode + 1) % 3)} style={{
            background: repeatMode > 0 ? '#1db954' : 'transparent',
            border: `1px solid ${repeatMode > 0 ? '#1db954' : theme.border}`,
            color: repeatMode > 0 ? '#fff' : theme.text,
            padding: '6px 12px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>
            {repeatMode === 0 ? '⟲' : repeatMode === 1 ? '⟲' : '⟳'}
          </button>
        </div>
      </div>
      {loading ? (
        <div style={{color: theme.textSecondary, textAlign: 'center', padding: '40px'}}>
          <div style={{fontSize: '32px', marginBottom: '16px'}}>♪</div>
          Loading your music...
        </div>
      ) : error ? (
        <div style={{color: '#ff6b6b', textAlign: 'center', padding: '40px'}}>
          <div style={{fontSize: '32px', marginBottom: '16px'}}>⚠</div>
          Error: {error}
        </div>
      ) : tracks.length === 0 ? (
        <div style={{color: theme.textSecondary, textAlign: 'center', padding: '40px'}}>
          <div style={{fontSize: '32px', marginBottom: '16px'}}>♪</div>
          No songs found
        </div>
      ) : (
        tracks.map((track, index) => {
          const trackColor = getTrackColor(index);
          return (
          <div key={track.id} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            background: currentTrack?.id === track.id ? `linear-gradient(135deg, ${trackColor}20, ${trackColor}10)` : 'transparent',
            border: `2px solid ${currentTrack?.id === track.id ? trackColor : 'transparent'}`,
            transition: 'all 0.3s ease',
            transform: currentTrack?.id === track.id ? 'scale(1.02)' : 'scale(1)',
            boxShadow: currentTrack?.id === track.id ? `0 8px 25px ${trackColor}30` : 'none',
            marginBottom: '8px'
          }}>
            <div onClick={() => playTrack(track)} style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: currentTrack?.id === track.id && isPlaying ? trackColor : `${trackColor}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: currentTrack?.id === track.id ? `0 4px 15px ${trackColor}50` : 'none'
            }}>
              {currentTrack?.id === track.id && isPlaying ? '⏸' : '▶'}
            </div>
            <div onClick={() => playTrack(track)} style={{flex: 1, marginLeft: '16px', cursor: 'pointer'}}>
              <div style={{
                color: currentTrack?.id === track.id ? trackColor : theme.text, 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '4px',
                textShadow: currentTrack?.id === track.id ? `0 0 10px ${trackColor}50` : 'none'
              }}>{track.title}</div>
              <div style={{color: theme.textSecondary, fontSize: '13px'}}>{track.artist}</div>
            </div>
            <button onClick={(e) => {
              e.stopPropagation();
              setFavorites(prev => 
                prev.includes(track.id) ? prev.filter(id => id !== track.id) : [...prev, track.id]
              );
            }} style={{
              background: 'none',
              border: 'none',
              color: favorites.includes(track.id) ? trackColor : theme.textSecondary,
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              transition: 'all 0.2s ease',
              transform: favorites.includes(track.id) ? 'scale(1.2)' : 'scale(1)'
            }}>♥</button>
            <div style={{color: theme.textSecondary, fontSize: '12px', marginLeft: '12px', minWidth: '40px'}}>{track.duration}</div>
          </div>
        );
        })
      )}
    </div>
  );
  
  const Player = () => currentTrack && (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: `linear-gradient(135deg, ${theme.card}f0, ${getTrackColor(currentTrackIndex)}08)`,
      backdropFilter: 'blur(10px)',
      borderTop: `1px solid ${getTrackColor(currentTrackIndex)}40`,
      padding: '20px 24px',
      boxShadow: `0 -4px 20px ${getTrackColor(currentTrackIndex)}20`,
      zIndex: 100
    }}>
      <div style={{
        width: '100%',
        height: '4px',
        background: `${theme.border}80`,
        borderRadius: '2px',
        cursor: 'pointer',
        marginBottom: '16px'
      }} onClick={seekTo}>
        <div style={{
          width: `${duration ? (progress / duration) * 100 : 0}%`,
          height: '100%',
          background: getTrackColor(currentTrackIndex),
          borderRadius: '2px',
          transition: 'width 0.1s ease',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            right: '-6px',
            top: '-2px',
            width: '8px',
            height: '8px',
            background: getTrackColor(currentTrackIndex),
            borderRadius: '50%',
            boxShadow: `0 0 8px ${getTrackColor(currentTrackIndex)}80`
          }} />
        </div>
      </div>
      
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{flex: '0 0 200px', minWidth: 0}}>
          <div style={{
            color: theme.text,
            fontSize: '16px', 
            fontWeight: '700', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            marginBottom: '2px'
          }}>{currentTrack.title}</div>
          <div style={{
            color: theme.textSecondary, 
            fontSize: '13px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap'
          }}>{currentTrack.artist}</div>
        </div>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <button onClick={() => setIsShuffled(!isShuffled)} style={{
            background: isShuffled ? `${getTrackColor(currentTrackIndex)}20` : 'transparent',
            border: 'none',
            color: isShuffled ? getTrackColor(currentTrackIndex) : theme.textSecondary,
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}>⚮</button>
          
          <button onClick={prevTrack} style={{
            background: 'transparent',
            border: 'none',
            color: theme.text,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}>⏮</button>
          
          <button onClick={togglePlay} style={{
            background: getTrackColor(currentTrackIndex),
            border: 'none',
            borderRadius: '50%',
            width: '52px',
            height: '52px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 6px 20px ${getTrackColor(currentTrackIndex)}40`,
            transition: 'all 0.2s ease',
            transform: 'scale(1)'
          }} onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.target.style.transform = 'scale(1)'}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button onClick={nextTrack} style={{
            background: 'transparent',
            border: 'none',
            color: theme.text,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}>⏭</button>
          
          <button onClick={() => setRepeatMode((repeatMode + 1) % 3)} style={{
            background: repeatMode > 0 ? `${getTrackColor(currentTrackIndex)}20` : 'transparent',
            border: 'none',
            color: repeatMode > 0 ? getTrackColor(currentTrackIndex) : theme.textSecondary,
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}>
            {repeatMode === 0 ? '⟲' : repeatMode === 1 ? '⟲' : '⟳'}
          </button>
        </div>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: '0 0 140px', justifyContent: 'flex-end'}}>
          <span style={{fontSize: '16px', color: theme.textSecondary}}>♬</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            style={{
              width: '70px',
              height: '4px',
              background: theme.border,
              borderRadius: '2px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <div style={{
            color: theme.textSecondary, 
            fontSize: '12px', 
            minWidth: '50px', 
            textAlign: 'right',
            fontFamily: 'monospace'
          }}>
            {Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      height: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overscrollBehavior: 'auto'
    }}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1001,
          background: theme.card,
          border: 'none',
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer',
          display: window.innerWidth <= 768 ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          width: '18px',
          height: '14px'
        }}>
          <div style={{
            width: '100%',
            height: '2px',
            background: theme.text,
            borderRadius: '1px',
            transform: sidebarOpen ? 'rotate(45deg) translate(5px, 5px)' : 'rotate(0deg)'
          }} />
          <div style={{
            width: '100%',
            height: '2px',
            background: theme.text,
            borderRadius: '1px',
            opacity: sidebarOpen ? 0 : 1
          }} />
          <div style={{
            width: '100%',
            height: '2px',
            background: theme.text,
            borderRadius: '1px',
            transform: sidebarOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'rotate(0deg)'
          }} />
        </div>
      </button>
      
      {window.innerWidth <= 768 && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `rgba(0,0,0,${sidebarOpen ? '0.5' : '0'})`,
            zIndex: 999,
            visibility: sidebarOpen ? 'visible' : 'hidden'
          }}
        />
      )}
      
      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        <Sidebar />
        <div style={{
          flex: 1,
          overflow: 'auto',
          paddingBottom: currentTrack ? '120px' : '0'
        }}>
          {currentView === 'search' ? <SearchView /> : 
           currentView === 'yourlibrary' ? <LibraryView /> : 
           currentView === 'recentlyplayed' ? <RecentlyPlayedView /> :
           <TrackList />}
        </div>
      </div>
      <Player />
    </div>
  );
}

export default App;