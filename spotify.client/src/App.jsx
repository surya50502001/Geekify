import { useState, useEffect } from 'react';
import { getAllSongs } from './services/songsService';

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.addEventListener('touchstart', () => {}, { passive: true });
    
    // Fetch songs from GitHub
    getAllSongs()
      .then(songs => {
        setTracks(songs);
        setLoading(false);
      })
      .catch(() => {
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
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
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
      flexDirection: 'column'
    }}>
      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        <Sidebar />
        <div style={{flex: 1, overflow: 'auto'}}>
          <TrackList />
        </div>
      </div>
      <Player />
    </div>
  );
}

export default App;