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

  useEffect(() => {
    document.addEventListener('touchstart', () => {}, { passive: true });
    
    // Enable pull-to-refresh
    document.body.style.overscrollBehavior = 'auto';
    document.documentElement.style.overscrollBehavior = 'auto';
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Fetch songs from GitHub
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
    }
    
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    setCurrentTrackIndex(trackIndex);
    
    const newAudio = new Audio(track.url);
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
      nextTrack();
    });
    newAudio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    });
    
    setAudio(newAudio);
    setCurrentTrack(track);
  };
  
  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    if (tracks[nextIndex]) {
      playTrack(tracks[nextIndex]);
    }
  };
  
  const prevTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    if (tracks[prevIndex]) {
      playTrack(tracks[prevIndex]);
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
      <h2 style={{color: '#1db954', margin: '0 0 24px 0', fontSize: '24px'}}>Geekify</h2>
      {['Home', 'Search', 'Your Library'].map(item => (
        <button key={item} onClick={() => setCurrentView(item.toLowerCase().replace(' ', ''))} style={{
          background: 'none',
          border: 'none',
          color: currentView === item.toLowerCase().replace(' ', '') ? '#1db954' : theme.textSecondary,
          padding: '12px 16px',
          textAlign: 'left',
          cursor: 'pointer',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: currentView === item.toLowerCase().replace(' ', '') ? 'bold' : 'normal'
        }}>{item}</button>
      ))}
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
        {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );

  const SearchView = () => {
    const filteredTracks = tracks.filter(track => 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return (
      <div style={{padding: '24px'}}>
        <h3 style={{color: theme.text, margin: '0 0 16px 0'}}>Search</h3>
        <input
          type="text"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '4px',
            color: theme.text,
            fontSize: '14px',
            marginBottom: '16px'
          }}
        />
        {filteredTracks.map((track, index) => {
          const trackColor = getTrackColor(index);
          return (
          <div key={track.id} onClick={() => playTrack(track)} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            background: currentTrack?.id === track.id ? `${trackColor}20` : 'transparent',
            border: `1px solid ${currentTrack?.id === track.id ? trackColor : 'transparent'}`,
            transition: 'all 0.2s ease',
            transform: currentTrack?.id === track.id ? 'scale(1.02)' : 'scale(1)',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentTrack?.id === track.id ? trackColor : `${trackColor}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {currentTrack?.id === track.id && isPlaying ? '♪' : index + 1}
            </div>
            <div style={{flex: 1, marginLeft: '16px'}}>
              <div style={{color: currentTrack?.id === track.id ? trackColor : theme.text, fontSize: '14px', fontWeight: '500'}}>{track.title}</div>
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
        <h3 style={{color: theme.text, margin: '0 0 16px 0'}}>Your Library</h3>
        {favoriteTracks.length === 0 ? (
          <div style={{color: theme.textSecondary, textAlign: 'center', padding: '40px'}}>No favorites yet</div>
        ) : (
          favoriteTracks.map((track, index) => {
            const trackColor = getTrackColor(tracks.findIndex(t => t.id === track.id));
            return (
            <div key={track.id} onClick={() => playTrack(track)} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: currentTrack?.id === track.id ? `${trackColor}20` : 'transparent',
              border: `1px solid ${currentTrack?.id === track.id ? trackColor : 'transparent'}`,
              transition: 'all 0.2s ease',
              transform: currentTrack?.id === track.id ? 'scale(1.02)' : 'scale(1)',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: currentTrack?.id === track.id ? trackColor : `${trackColor}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {currentTrack?.id === track.id && isPlaying ? '♪' : '♥'}
              </div>
              <div style={{flex: 1, marginLeft: '16px'}}>
                <div style={{color: currentTrack?.id === track.id ? trackColor : theme.text, fontSize: '14px', fontWeight: '500'}}>{track.title}</div>
                <div style={{color: theme.textSecondary, fontSize: '12px'}}>{track.artist}</div>
              </div>
              <div style={{color: theme.textSecondary, fontSize: '12px'}}>{track.duration}</div>
            </div>
          );
          })
        )}
      </div>
    );
  };
  
  const TrackList = () => (
    <div style={{padding: '24px'}}>
      <h3 style={{color: theme.text, margin: '0 0 16px 0'}}>Songs from Repository</h3>
      {loading ? (
        <div style={{color: theme.textSecondary, textAlign: 'center', padding: '40px'}}>Loading songs...</div>
      ) : error ? (
        <div style={{color: '#ff6b6b', textAlign: 'center', padding: '40px'}}>Error: {error}</div>
      ) : tracks.length === 0 ? (
        <div style={{color: theme.textSecondary, textAlign: 'center', padding: '40px'}}>No songs found</div>
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
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: currentTrack?.id === track.id && isPlaying ? trackColor : `${trackColor}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '14px',
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
              fontSize: '18px',
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
      background: `linear-gradient(135deg, ${theme.card}, ${getTrackColor(currentTrackIndex)}10)`,
      borderTop: `2px solid ${getTrackColor(currentTrackIndex)}`,
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{
        width: '100%',
        height: '4px',
        background: theme.border,
        borderRadius: '2px',
        cursor: 'pointer'
      }}>
        <div style={{
          width: `${duration ? (progress / duration) * 100 : 0}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${getTrackColor(currentTrackIndex)}, ${getTrackColor(currentTrackIndex)}80)`,
          borderRadius: '2px',
          transition: 'width 0.1s ease',
          boxShadow: `0 0 10px ${getTrackColor(currentTrackIndex)}50`
        }} />
      </div>
      
      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{
            color: getTrackColor(currentTrackIndex), 
            fontSize: '15px', 
            fontWeight: '600', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            textShadow: `0 0 10px ${getTrackColor(currentTrackIndex)}30`
          }}>{currentTrack.title}</div>
          <div style={{color: theme.textSecondary, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{currentTrack.artist}</div>
        </div>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <button onClick={prevTrack} style={{
            background: 'none',
            border: 'none',
            color: theme.text,
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            transition: 'all 0.2s ease'
          }}>⏮</button>
          
          <button onClick={togglePlay} style={{
            background: getTrackColor(currentTrackIndex),
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 15px ${getTrackColor(currentTrackIndex)}40`,
            transition: 'all 0.2s ease'
          }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button onClick={nextTrack} style={{
            background: 'none',
            border: 'none',
            color: theme.text,
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            transition: 'all 0.2s ease'
          }}>⏭</button>
        </div>
        
        <div style={{color: theme.textSecondary, fontSize: '11px', minWidth: '80px', textAlign: 'right'}}>
          {Math.floor(progress / 60)}:{Math.floor(progress % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
          transform: 'rotate(0deg)'
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
          overflow: 'auto'
        }}>
          {currentView === 'search' ? <SearchView /> : 
           currentView === 'yourlibrary' ? <LibraryView /> : 
           <TrackList />}
        </div>
      </div>
      <Player />
    </div>
  );
}

export default App;