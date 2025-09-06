import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import Messaging from './components/Messaging';
import './App.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ourSongs, setOurSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [spinnerColor, setSpinnerColor] = useState('#1db954');
  const audioRef = useRef(null);
  
  const saveAppState = () => {
    const state = {
      currentSong,
      isPlaying,
      currentTime,
      activeMenu,
      searchTerm,
      isDarkTheme,
      sidebarOpen,
      ourSongs
    };
    sessionStorage.setItem('appState', JSON.stringify(state));
  };
  
  const loadAppState = () => {
    const saved = sessionStorage.getItem('appState');
    if (saved) {
      const state = JSON.parse(saved);
      setCurrentSong(state.currentSong || 0);
      setIsPlaying(false);
      setCurrentTime(state.currentTime || 0);
      setActiveMenu(state.activeMenu || 'Home');
      setSearchTerm(state.searchTerm || '');
      setIsDarkTheme(state.isDarkTheme ?? true);
      setSidebarOpen(state.sidebarOpen ?? true);
      if (state.ourSongs) setOurSongs(state.ourSongs);
    }
  };
  
  useEffect(() => {
    loadAppState();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
      document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';
    }
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    const saveInterval = setInterval(saveAppState, 10000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(saveInterval);
      saveAppState();
    };
  }, []);
  
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    document.body.className = newTheme ? 'dark-theme' : '';
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  useEffect(() => {
    const sampleSongs = [
      { title: 'Sample Song 1', artist: 'Artist 1', url: '#' },
      { title: 'Sample Song 2', artist: 'Artist 2', url: '#' },
      { title: 'Sample Song 3', artist: 'Artist 3', url: '#' }
    ];
    setOurSongs(sampleSongs);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('durationchange', updateDuration);
      audio.addEventListener('canplaythrough', updateDuration);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('durationchange', updateDuration);
        audio.removeEventListener('canplaythrough', updateDuration);
      };
    }
  }, [ourSongs, currentSong]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
    saveAppState();
  };

  const playNext = () => {
    const nextSong = (currentSong + 1) % ourSongs.length;
    setCurrentSong(nextSong);
    setCurrentTime(0);
    setDuration(0);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.log('Autoplay prevented:', error);
          setIsPlaying(false);
        });
      }
    }, 100);
    saveAppState();
  };

  const playPrev = () => {
    const prevSong = currentSong === 0 ? ourSongs.length - 1 : currentSong - 1;
    setCurrentSong(prevSong);
    setCurrentTime(0);
    setDuration(0);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.log('Autoplay prevented:', error);
          setIsPlaying(false);
        });
      }
    }, 100);
    saveAppState();
  };

  const songColors = ['#1db954', '#e22856', '#ff6600', '#8e44ad', '#3498db', '#f39c12', '#e74c3c', '#9b59b6'];
  
  const getCurrentColor = () => {
    return songColors[currentSong % songColors.length] || '#1db954';
  };

  if (isLoading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000'}}>
        <div style={{color: spinnerColor, fontSize: '18px'}}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="app" style={{display: 'flex', height: '100vh', background: isDarkTheme ? '#000000' : '#ffffff', color: isDarkTheme ? '#ffffff' : '#000000', fontFamily: 'Arial, sans-serif'}}>
      <Sidebar 
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        setSidebarOpen={setSidebarOpen}
        sidebarOpen={sidebarOpen}
        getCurrentColor={getCurrentColor}
        isDarkTheme={isDarkTheme}
      />
      
      <div className="main-content" style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <div style={{padding: '20px', flex: 1, overflowY: 'auto'}}>
          <h1 style={{fontSize: '32px', margin: '0 0 20px 0', color: getCurrentColor()}}>Geekify</h1>
          
          {activeMenu === 'Our Songs' && (
            <div>
              <h2 style={{fontSize: '24px', marginBottom: '20px'}}>Our Songs</h2>
              <div style={{display: 'grid', gap: '12px'}}>
                {ourSongs.map((song, index) => (
                  <div key={index} onClick={() => {
                    setCurrentSong(index);
                    setIsPlaying(true);
                    setTimeout(() => {
                      if (audioRef.current) {
                        audioRef.current.load();
                        audioRef.current.play();
                      }
                    }, 100);
                  }} style={{padding: '12px', background: isDarkTheme ? '#181818' : '#f5f5f5', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', border: currentSong === index ? `2px solid ${getCurrentColor()}` : '2px solid transparent'}}>
                    <div style={{width: '48px', height: '48px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div>
                      <div style={{fontWeight: '500'}}>{song.title}</div>
                      <div style={{fontSize: '14px', color: '#b3b3b3'}}>{song.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeMenu === 'Search' && (
            <div>
              <h2 style={{fontSize: '24px', marginBottom: '20px'}}>Search</h2>
              <input 
                type="text" 
                placeholder="Search for songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `2px solid ${getCurrentColor()}40`,
                  background: isDarkTheme ? '#181818' : '#f5f5f5',
                  color: isDarkTheme ? '#fff' : '#000',
                  fontSize: '16px',
                  marginBottom: '20px',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <div style={{display: 'grid', gap: '12px'}}>
                  {ourSongs.filter(song => 
                    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((song, index) => (
                    <div key={index} style={{padding: '12px', background: isDarkTheme ? '#181818' : '#f5f5f5', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div style={{width: '48px', height: '48px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <div>
                        <div style={{fontWeight: '500'}}>{song.title}</div>
                        <div style={{fontSize: '14px', color: '#b3b3b3'}}>{song.artist}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeMenu === 'Home' && (
            <div>
              <h2 style={{fontSize: '24px', marginBottom: '20px'}}>Welcome to Geekify</h2>
              <p style={{color: '#b3b3b3', marginBottom: '20px'}}>Your music streaming experience</p>
              <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                <button 
                  onClick={toggleTheme}
                  style={{
                    background: getCurrentColor(),
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
                </button>
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{
                    background: 'transparent',
                    border: `2px solid ${getCurrentColor()}`,
                    color: getCurrentColor(),
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {sidebarOpen ? 'Hide' : 'Show'} Menu
                </button>
              </div>
            </div>
          )}
          
          {activeMenu === 'Messages' && (
            <Messaging 
              isDarkTheme={isDarkTheme}
              getCurrentColor={getCurrentColor}
            />
          )}
        </div>
      </div>
      
      <MusicPlayer 
        allSongs={ourSongs}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        saveAppState={saveAppState}
        audioRef={audioRef}
        getCurrentColor={getCurrentColor}
        formatTime={formatTime}
        handleProgressClick={handleProgressClick}
        playPrev={playPrev}
        togglePlay={togglePlay}
        playNext={playNext}
      />
    </div>
  );
}

export default App;