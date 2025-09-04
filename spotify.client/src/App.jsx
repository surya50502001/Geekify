import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [songs, setSongs] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [spinnerColor, setSpinnerColor] = useState('#1db954');
  const audioRef = useRef(null);
  
  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
      document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';
    }
    
    // Check for updates
    const currentVersion = '1.5.0'; // Update this when you make changes
    const lastVersion = localStorage.getItem('appVersion');
    const notifiedVersion = localStorage.getItem('notifiedVersion');
    
    // Show notification only if version changed and user hasn't been notified
    if (lastVersion && lastVersion !== currentVersion && notifiedVersion !== currentVersion) {
      setShowUpdateNotification(true);
    } else if (!lastVersion && notifiedVersion !== currentVersion) {
      setTimeout(() => setShowUpdateNotification(true), 5000);
    }
    localStorage.setItem('appVersion', currentVersion);
    
    // Real-time update checker
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/version.json?' + Date.now());
        const data = await response.json();
        if (data.version !== currentVersion) {
          setShowUpdateNotification(true);
        }
      } catch (error) {
        // Fallback: check every 30 seconds for changes
        const stored = localStorage.getItem('appVersion');
        if (stored !== currentVersion) {
          setShowUpdateNotification(true);
        }
      }
    };
    
    // Check for updates every 30 seconds
    const updateInterval = setInterval(checkForUpdates, 30000);
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(updateInterval);
    };
  }, []);
  
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    document.body.className = newTheme ? 'dark-theme' : '';
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Create local preview
      const url = URL.createObjectURL(file);
      const newSong = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Uploaded by User',
        url: url,
        file: file
      };
      
      // Send to your local server
      const formData = new FormData();
      formData.append('song', file);
      
      try {
        const response = await fetch('http://localhost:3001/upload', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.success) {
          console.log('Song saved to your computer:', result.originalName);
        }
      } catch (error) {
          console.log('Server not running - song only available locally', error);
      }
      
      setUploadProgress(100);
      setTimeout(() => {
        setUploadedSongs(prev => [...prev, newSong]);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };
  
  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        timestamp: new Date().toLocaleTimeString()
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };
  
  const downloadSong = (song) => {
    if (song.file) {
      const a = document.createElement('a');
      a.href = song.url;
      a.download = `${song.title}.${song.file.name.split('.').pop()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
  const allSongs = [...songs, ...uploadedSongs];
  
  const songColors = ['#1db954', '#e22856', '#ff6600', '#8e44ad', '#3498db', '#f39c12', '#e74c3c', '#9b59b6'];
  
  const getCurrentColor = () => {
    return songColors[currentSong % songColors.length] || '#1db954';
  };
  
  const changeSpinnerColor = () => {
    const randomColor = songColors[Math.floor(Math.random() * songColors.length)];
    setSpinnerColor(randomColor);
  };
  
  const toggleLike = () => {
    const newLiked = new Set(likedSongs);
    if (newLiked.has(currentSong)) {
      newLiked.delete(currentSong);
    } else {
      newLiked.add(currentSong);
    }
    setLikedSongs(newLiked);
  };
  
  useEffect(() => {
    fetch('https://api.github.com/repos/surya50502001/Spotify-/contents')
      .then(res => res.json())
      .then(files => {
        const mp3Files = files.filter(file => file.name.endsWith('.mp3'));
        const songList = mp3Files.map(file => ({
          title: file.name.replace('.mp3', '').replace(/%20/g, ' '),
          artist: 'Unknown Artist',
          url: file.download_url
        }));
        setSongs(songList);
      })
      .catch(err => console.error('Error loading songs:', err));
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
  }, [songs, currentSong]);

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
  };

  const playNext = () => {
    const nextSong = (currentSong + 1) % allSongs.length;
    setCurrentSong(nextSong);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  };

  const playPrev = () => {
    const prevSong = currentSong === 0 ? allSongs.length - 1 : currentSong - 1;
    setCurrentSong(prevSong);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  };

  if (isLoading) {
    return (
      <div style={{background: '#000', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial'}}>
        <div style={{textAlign: 'center'}}>
          <div onClick={changeSpinnerColor} style={{width: '80px', height: '80px', margin: '0 auto 20px', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0}}>
            <svg width="80" height="80" viewBox="0 0 100 100" fill={spinnerColor} style={{animation: 'spin 2s linear infinite'}}>
              <circle cx="50" cy="50" r="45" fill="none" stroke={spinnerColor} strokeWidth="3"/>
              <circle cx="50" cy="50" r="35" fill="none" stroke={spinnerColor} strokeWidth="2"/>
              <circle cx="50" cy="50" r="25" fill="none" stroke={spinnerColor} strokeWidth="2"/>
              <circle cx="50" cy="50" r="8" fill={spinnerColor}/>
              <polygon points="42,35 42,65 65,50" fill={spinnerColor}/>
            </svg>
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: spinnerColor,
            textShadow: `0 0 5px ${spinnerColor}, 0 0 10px ${spinnerColor}, 0 0 15px ${spinnerColor}`,
            letterSpacing: '1px',
            fontFamily: 'Arial, sans-serif',
            marginBottom: '16px'
          }}>GEEKIFY</div>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', color: spinnerColor, margin: 0}}>Welcome!</h2>
          <p style={{color: '#b3b3b3', fontSize: '14px', marginTop: '8px'}}>Loading your music experience...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{background: isDarkTheme ? '#000000' : '#ffffff', color: isDarkTheme ? '#ffffff' : '#000000', minHeight: '100vh', fontFamily: 'Arial', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'background-color 0.3s ease, color 0.3s ease'}}>
      <style>{`
        @media (max-width: 768px) {
          .sidebar { width: ${sidebarOpen ? '100vw' : '0'} !important; position: fixed !important; z-index: 999 !important; height: 100vh !important; }
          .main-content { padding: 16px 12px !important; }
          .home-card { max-width: 100% !important; padding: 24px 16px !important; margin: 0 8px !important; }
          .library-list { padding: 8px !important; }
          .library-item { flex-direction: column !important; text-align: center !important; }
          .search-input { width: calc(100% - 24px) !important; max-width: none !important; }
          .player-controls { width: 50% !important; }
          .song-info { width: 35% !important; font-size: 12px !important; }
          .song-info div { max-width: 100px !important; }
          .volume-section { display: none !important; }
          .home-card-content { flex-direction: column !important; text-align: center !important; }
          .home-card-image { width: 120px !important; height: 120px !important; margin: 0 auto 16px !important; }
          .home-card-details { width: 100% !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; padding: 16px !important; }
          .hamburger-btn { top: 16px !important; right: 16px !important; width: 48px !important; height: 36px !important; }
          .bottom-player { padding: 0 12px !important; height: 80px !important; }
          .song-card { padding: 12px !important; }
          .song-card-image { height: 120px !important; }
          .song-title { font-size: 13px !important; }
          .song-artist { font-size: 11px !important; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes slideIn {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes crack {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(2deg); }
          50% { transform: scale(1.1) rotate(-1deg); }
          75% { transform: scale(1.05) rotate(1deg); }
        }
        @keyframes crackLine {
          0% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.2); }
        }
        @keyframes burstOut {
          0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
          20% { transform: translate(0, 0) scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: translate(var(--random-x, 100px), var(--random-y, -100px)) scale(0.5) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes playPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
      <div style={{display: 'flex', flex: 1}}>
        {/* Top Controls */}
        <div style={{position: 'fixed', top: '20px', right: '20px', zIndex: 1001, display: 'flex', gap: '12px'}}>
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            style={{
              background: `rgba(${parseInt(getCurrentColor().slice(1,3), 16)}, ${parseInt(getCurrentColor().slice(3,5), 16)}, ${parseInt(getCurrentColor().slice(5,7), 16)}, 0.9)`,
              border: 'none',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d={isDarkTheme ? "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" : "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"} />
            </svg>
          </button>
          
          {/* Hamburger Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hamburger-btn"
            style={{
              background: `rgba(${parseInt(getCurrentColor().slice(1,3), 16)}, ${parseInt(getCurrentColor().slice(3,5), 16)}, ${parseInt(getCurrentColor().slice(5,7), 16)}, 0.9)`,
              border: 'none',
              borderRadius: '12px',
              width: '56px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              const color = getCurrentColor();
              e.target.style.background = color;
            }}
            onMouseLeave={(e) => {
              const color = getCurrentColor();
              const r = parseInt(color.slice(1,3), 16);
              const g = parseInt(color.slice(3,5), 16);
              const b = parseInt(color.slice(5,7), 16);
              e.target.style.background = `rgba(${r}, ${g}, ${b}, 0.9)`;
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{transition: 'transform 0.2s ease'}}>
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
        </div>
        
        {/* Sidebar */}
        <Sidebar 
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          getCurrentColor={getCurrentColor}
          isDarkTheme={isDarkTheme}
        />
        
        {/* Main Content */}
        <div className="main-content" style={{flex: 1, background: isDarkTheme ? `linear-gradient(180deg, ${getCurrentColor()}40 0%, #000000 100%)` : `linear-gradient(180deg, ${getCurrentColor()}20 0%, #f8f9fa 100%)`, padding: '24px', paddingBottom: '120px', transition: 'background 0.3s ease'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
              <svg width="48" height="36" viewBox="0 0 100 100" fill={getCurrentColor()}>
                <circle cx="50" cy="50" r="45" fill="none" stroke={getCurrentColor()} strokeWidth="3"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke={getCurrentColor()} strokeWidth="2"/>
                <circle cx="50" cy="50" r="25" fill="none" stroke={getCurrentColor()} strokeWidth="2"/>
                <circle cx="50" cy="50" r="8" fill={getCurrentColor()}/>
                <polygon points="42,35 42,65 65,50" fill={getCurrentColor()}/>
              </svg>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: getCurrentColor(),
                textShadow: `0 0 5px ${getCurrentColor()}, 0 0 10px ${getCurrentColor()}, 0 0 15px ${getCurrentColor()}`,
                letterSpacing: '1px',
                fontFamily: 'Arial, sans-serif',
                width: '48px',
                textAlign: 'center'
              }}>GEEKIFY</div>
            </div>
            <h2 style={{fontSize: '24px', fontWeight: '600', margin: 0, fontFamily: 'Arial, sans-serif'}}>Hello Melophile</h2>
          </div>
          
          {activeMenu === 'Home' && (
            <div style={{textAlign: 'center', padding: '60px 20px'}}>
              <h3 style={{fontSize: '24px', marginBottom: '16px'}}>Welcome!</h3>
              <p style={{color: '#b3b3b3', fontSize: '16px', marginBottom: '40px'}}>Your music streaming experience starts here</p>
              
              {songs.length > 0 && (
                <div className="home-card" style={{background: 'linear-gradient(145deg, #1e1e1e, #2a2a2a)', padding: '40px', borderRadius: '20px', maxWidth: '480px', margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid #333'}}>
                  <div className="home-card-content" style={{display: 'flex', gap: '24px', marginBottom: '32px'}}>
                    <div className="home-card-image" style={{width: '140px', height: '140px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${getCurrentColor()}40`}}>
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                    </div>
                    <div className="home-card-details" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                      <h3 style={{fontSize: '24px', fontWeight: '700', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff', maxWidth: '280px'}}>{songs[currentSong]?.title || 'No Song Selected'}</h3>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(songs[currentSong]?.artist || 'Artist')}&background=${getCurrentColor().slice(1)}&color=fff&size=32&rounded=true`}
                          alt="Artist"
                          style={{width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${getCurrentColor()}`}}
                        />
                        <span style={{color: getCurrentColor(), fontSize: '16px', fontWeight: '500'}}>{songs[currentSong]?.artist || ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stats-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid #444'}}>
                    <div style={{textAlign: 'center'}}>
                      <div style={{color: getCurrentColor(), fontSize: '18px', fontWeight: '600'}}>{formatTime(duration) || '--:--'}</div>
                      <div style={{color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Duration</div>
                    </div>
                    <div style={{textAlign: 'center'}}>
                      <div style={{color: getCurrentColor(), fontSize: '18px', fontWeight: '600'}}>Pop</div>
                      <div style={{color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Genre</div>
                    </div>
                    <div style={{textAlign: 'center'}}>
                      <div style={{color: getCurrentColor(), fontSize: '18px', fontWeight: '600'}}>2023</div>
                      <div style={{color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Release</div>
                    </div>
                    <div style={{textAlign: 'center'}}>
                      <div style={{color: getCurrentColor(), fontSize: '18px', fontWeight: '600'}}>320kbps</div>
                      <div style={{color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Quality</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeMenu === 'Search' && (
            <div>
              <div style={{marginBottom: '24px'}}>
                <input 
                  type="text" 
                  placeholder="Search for songs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{
                    width: '400px',
                    padding: '12px 16px',
                    borderRadius: '24px',
                    border: 'none',
                    background: '#242424',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              {searchTerm && (
                <div className="song-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px'}}>
                  {allSongs.filter(song => 
                    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((song, index) => (
                    <div key={index} onClick={() => {setCurrentSong(allSongs.indexOf(song)); setIsPlaying(true);}} className="song-card" style={{
                      background: '#181818',
                      padding: '16px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <div className="song-card-image" style={{width: '100%', height: '148px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                      </div>
                      <div className="song-title" style={{fontWeight: 'bold', marginBottom: '4px', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{song.title}</div>
                      <div className="song-artist" style={{color: '#b3b3b3', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{song.artist}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeMenu === 'Library' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <h3 style={{fontSize: '20px', margin: 0}}>Your Library</h3>
                <label style={{background: getCurrentColor(), color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}>
                  + Upload Song
                  <input type="file" accept="audio/*" onChange={handleFileUpload} style={{display: 'none'}} />
                </label>
              </div>
              {isUploading && (
                <div style={{background: '#181818', padding: '16px', borderRadius: '8px', marginBottom: '16px'}}>
                  <div style={{marginBottom: '8px'}}>Uploading... {uploadProgress}%</div>
                  <div style={{width: '100%', height: '4px', background: '#333', borderRadius: '2px'}}>
                    <div style={{width: `${uploadProgress}%`, height: '100%', background: getCurrentColor(), borderRadius: '2px', transition: 'width 0.3s ease'}}></div>
                  </div>
                </div>
              )}
              
              <div style={{marginBottom: '32px'}}>
                {allSongs.length > 0 ? allSongs.map((song, index) => (
                  <div key={index} onClick={() => {setCurrentSong(index); setIsPlaying(true);}} style={{
                    background: '#181818',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    ':hover': {background: '#282828'}
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px', flex: 1}}>
                      <div style={{width: '48px', height: '48px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                      </div>
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: 'bold', fontSize: '14px', marginBottom: '4px'}}>{song.title}</div>
                        <div style={{color: '#b3b3b3', fontSize: '12px'}}>{song.artist}</div>
                      </div>
                    </div>
                    {song.file && (
                      <button 
                        onClick={(e) => {e.stopPropagation(); downloadSong(song);}} 
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: getCurrentColor(),
                          cursor: 'pointer',
                          padding: '8px'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                      </button>
                    )}
                  </div>
                )) : <div>Loading songs...</div>}
              </div>
              
              <div style={{background: '#181818', padding: '20px', borderRadius: '12px'}}>
                <h4 style={{fontSize: '18px', marginBottom: '16px', color: getCurrentColor()}}>Comments</h4>
                <div style={{marginBottom: '16px'}}>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#242424',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    />
                    <button 
                      onClick={addComment}
                      style={{
                        background: getCurrentColor(),
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 16px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Post
                    </button>
                  </div>
                </div>
                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {comments.length > 0 ? comments.map(comment => (
                    <div key={comment.id} style={{padding: '8px 0', borderBottom: '1px solid #333'}}>
                      <div style={{fontSize: '14px', marginBottom: '4px'}}>{comment.text}</div>
                      <div style={{fontSize: '11px', color: '#666'}}>{comment.timestamp}</div>
                    </div>
                  )) : (
                    <div style={{color: '#666', fontSize: '14px'}}>No comments yet. Be the first to comment!</div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeMenu === 'Liked' && (
            <div style={{padding: '20px'}}>
              <h3 style={{fontSize: '24px', marginBottom: '24px', color: getCurrentColor()}}>Liked Songs</h3>
              {Array.from(likedSongs).length > 0 ? (
                <div>
                  {Array.from(likedSongs).map(songIndex => {
                    const song = allSongs[songIndex];
                    return song ? (
                      <div key={songIndex} onClick={() => {setCurrentSong(songIndex); setIsPlaying(true);}} style={{
                        background: isDarkTheme ? '#181818' : '#f0f0f0',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div style={{width: '48px', height: '48px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                        </div>
                        <div style={{flex: 1}}>
                          <div style={{fontWeight: 'bold', fontSize: '14px', marginBottom: '4px'}}>{song.title}</div>
                          <div style={{color: '#b3b3b3', fontSize: '12px'}}>{song.artist}</div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={getCurrentColor()}>
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '60px 20px'}}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="#666" style={{marginBottom: '16px'}}>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <p style={{color: '#b3b3b3', fontSize: '16px'}}>No liked songs yet</p>
                  <p style={{color: '#666', fontSize: '14px'}}>Songs you like will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Update Notification */}
      {showUpdateNotification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 2001,
          background: isDarkTheme ? '#1e1e1e' : '#ffffff',
          border: `2px solid ${getCurrentColor()}`,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          maxWidth: '300px',
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={getCurrentColor()}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z"/>
            </svg>
            <h4 style={{margin: 0, fontSize: '16px', color: getCurrentColor()}}>Update Available!</h4>
          </div>
          <p style={{margin: '0 0 16px 0', fontSize: '14px', color: isDarkTheme ? '#b3b3b3' : '#666', lineHeight: '1.4'}}>New features and improvements are ready. Refresh to get the latest version.</p>
          <div style={{display: 'flex', gap: '8px'}}>
            <button 
              onClick={() => {
                localStorage.setItem('notifiedVersion', '1.5.0');
                window.location.reload();
              }}
              style={{
                background: getCurrentColor(),
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Refresh Now
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('notifiedVersion', '1.5.0');
                setShowUpdateNotification(false);
              }}
              style={{
                background: 'transparent',
                border: `1px solid ${isDarkTheme ? '#444' : '#ddd'}`,
                borderRadius: '6px',
                padding: '8px 16px',
                color: isDarkTheme ? '#b3b3b3' : '#666',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}
      
      {/* Bottom Player */}
      <MusicPlayer 
        allSongs={allSongs}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        likedSongs={likedSongs}
        audioRef={audioRef}
        getCurrentColor={getCurrentColor}
        formatTime={formatTime}
        handleProgressClick={handleProgressClick}
        playPrev={playPrev}
        togglePlay={togglePlay}
        playNext={playNext}
        toggleLike={toggleLike}
      />
    </div>
  );
}

export default App;