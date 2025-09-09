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
  const togglePlay = () => setIsPlaying(!isPlaying);
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const theme = {
    bg: isDarkTheme ? '#121212' : '#ffffff',
    sidebar: isDarkTheme ? '#000000' : '#f8f9fa',
    card: isDarkTheme ? '#181818' : '#ffffff',
    text: isDarkTheme ? '#ffffff' : '#000000',
    textSecondary: isDarkTheme ? '#b3b3b3' : '#6c757d',
    border: isDarkTheme ? '#282828' : '#dee2e6'
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
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        tracks.map((track, index) => (
          <div key={track.id} onClick={() => playTrack(track)} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            background: currentTrack?.id === track.id ? theme.border : 'transparent'
          }}>
            <span style={{color: theme.textSecondary, width: '20px', fontSize: '14px'}}>{index + 1}</span>
            <div style={{flex: 1, marginLeft: '16px'}}>
              <div style={{color: theme.text, fontSize: '14px', fontWeight: '500'}}>{track.title}</div>
              <div style={{color: theme.textSecondary, fontSize: '12px'}}>{track.artist}</div>
            </div>
            <div style={{color: theme.textSecondary, fontSize: '12px'}}>{track.duration}</div>
          </div>
        ))
      )}
    </div>
  );

  const Player = () => currentTrack && (
    <div style={{
      background: theme.card,
      borderTop: `1px solid ${theme.border}`,
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{flex: 1}}>
        <div style={{color: theme.text, fontSize: '14px', fontWeight: '500'}}>{currentTrack.title}</div>
        <div style={{color: theme.textSecondary, fontSize: '12px'}}>{currentTrack.artist}</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
        <button onClick={togglePlay} style={{
          background: '#1db954',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
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
          transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)'
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
            transition: 'all 0.3s ease',
            transform: sidebarOpen ? 'rotate(45deg) translate(5px, 5px)' : 'rotate(0deg)'
          }} />
          <div style={{
            width: '100%',
            height: '2px',
            background: theme.text,
            borderRadius: '1px',
            transition: 'all 0.3s ease',
            opacity: sidebarOpen ? 0 : 1
          }} />
          <div style={{
            width: '100%',
            height: '2px',
            background: theme.text,
            borderRadius: '1px',
            transition: 'all 0.3s ease',
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
            visibility: sidebarOpen ? 'visible' : 'hidden',
            transition: 'all 0.3s ease'
          }}
        />
      )}
      
      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        <Sidebar />
        <div style={{
          flex: 1,
          overflow: 'auto',
          marginLeft: window.innerWidth <= 768 ? '0' : '0'
        }}>
          <TrackList />
        </div>
      </div>
      <Player />
    </div>
  );
}

export default App;