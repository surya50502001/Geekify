import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';


function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ourSongs, setOurSongs] = useState([]); // GitHub + approved songs

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);


  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [spinnerColor, setSpinnerColor] = useState('#1db954');
  const [serverStatus, setServerStatus] = useState('checking');
  const audioRef = useRef(null);
  
  const saveAppState = () => {
    const state = {
      currentSong,
      isPlaying,
      currentTime,
      activeMenu,
      searchTerm,
      comments,
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
      setComments(state.comments || []);
      setIsDarkTheme(state.isDarkTheme ?? true);
      setSidebarOpen(state.sidebarOpen ?? true);

      if (state.ourSongs) setOurSongs(state.ourSongs);
    }
  };
  
  useEffect(() => {
    // PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Load cached app state first
    loadAppState();
    

    
    // Load theme preference (override cache if exists)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
      document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';
    }
    

    
    const savedOurSongs = localStorage.getItem('ourSongs');
    if (savedOurSongs) {
      setOurSongs(JSON.parse(savedOurSongs));
    }
    
    // Update check disabled
    // const checkForUpdates = async () => {};
    // const updateInterval = null;
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Check C# server status
    const checkServerStatus = async () => {
      try {
        const response = await fetch('https://7fb4c4f68de7.ngrok-free.app/api/song/songs', {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        console.log('Server check failed:', error);
        setServerStatus('offline');
      }
    };
    
    checkServerStatus();
    const serverCheckInterval = setInterval(checkServerStatus, 30000);
    
    // Auto-save state periodically
    const saveInterval = setInterval(saveAppState, 10000); // Save every 10 seconds
    
    return () => {
      clearTimeout(timer);
      clearInterval(saveInterval);
      clearInterval(serverCheckInterval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      saveAppState(); // Save on unmount
    };
  }, []);
  
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    document.body.className = newTheme ? 'dark-theme' : '';
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
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
  

  
  const handleRefresh = () => {
    saveAppState();
    setUpdateAvailable(false);
    window.location.reload();
  };
  
  const dismissUpdate = () => {
    setUpdateAvailable(false);
    localStorage.setItem('updateDismissed', Date.now().toString());
  };
  
  const allSongs = [...ourSongs]; // All songs from Our Songs playlist
  
  const songColors = ['#1db954', '#e22856', '#ff6600', '#8e44ad', '#3498db', '#f39c12', '#e74c3c', '#9b59b6'];
  
  const getCurrentColor = () => {
    return songColors[currentSong % songColors.length] || '#1db954';
  };
  
  const changeSpinnerColor = () => {
    const randomColor = songColors[Math.floor(Math.random() * songColors.length)];
    setSpinnerColor(randomColor);
  };
  
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };
  

  
  useEffect(() => {
    // Load GitHub songs into Our Songs playlist
    fetch('https://api.github.com/repos/surya50502001/Spotify-/contents')
      .then(res => res.json())
      .then(files => {
        const mp3Files = files.filter(file => file.name.endsWith('.mp3'));
        const songList = mp3Files.map(file => ({
          title: file.name.replace('.mp3', '').replace(/%20/g, ' '),
          artist: 'Unknown Artist',
          url: file.download_url,
          isGitHubSong: true
        }));
        setOurSongs(songList);
        localStorage.setItem('ourSongs', JSON.stringify(songList));
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
  }, [allSongs, currentSong]);

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
    const nextSong = (currentSong + 1) % allSongs.length;
    setCurrentSong(nextSong);
    setCurrentTime(0);
    setDuration(0);
    // Load and play the new song
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
    const prevSong = currentSong === 0 ? allSongs.length - 1 : currentSong - 1;
    setCurrentSong(prevSong);
    setCurrentTime(0);
    setDuration(0);
    // Load and play the new song
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

  if (isLoading) {
    return (
      <div style={{background: '#000', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial'}}>
        <div style={{textAlign: 'center'}}>
          <div onClick={changeSpinnerColor} style={{width: '60px', height: '60px', margin: '0 auto 20px', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0}}>
            <svg width="60" height="60" viewBox="0 0 100 100" fill={spinnerColor} style={{animation: 'spin 2s linear infinite'}}>
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
    <div style={{background: isDarkTheme ? '#000000' : '#ffffff', color: isDarkTheme ? '#ffffff' : '#000000', minHeight: '100vh', fontFamily: 'Arial', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'background-color 0.3s ease, color 0.3s ease', paddingTop: 'env(safe-area-inset-top)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)'}}>
      <style>{`
        @media (max-width: 768px) {
          .sidebar { width: ${sidebarOpen ? '100vw' : '0'} !important; position: fixed !important; z-index: 999 !important; height: 100vh !important; }
          .main-content { padding: 8px !important; padding-top: 70px !important; padding-bottom: 90px !important; }
          .top-controls { top: env(safe-area-inset-top, 8px) !important; right: 8px !important; gap: 4px !important; }
          .top-controls button { width: 44px !important; height: 44px !important; }
          .header-section { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 8px !important; margin-bottom: 16px !important; }
          .header-logo { margin-bottom: 8px !important; }
          .header-info { width: 100% !important; }
          .header-info h2 { font-size: 18px !important; }
          .user-controls { justify-content: center !important; flex-wrap: wrap !important; }
          .home-card { max-width: 100% !important; padding: 16px !important; margin: 0 !important; }
          .home-card-content { flex-direction: column !important; text-align: center !important; gap: 16px !important; }
          .home-card-image { width: 120px !important; height: 120px !important; margin: 0 auto !important; }
          .home-card-details { width: 100% !important; }
          .home-card-details h3 { font-size: 20px !important; max-width: 100% !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; padding: 16px !important; }
          .search-input { width: calc(100% - 16px) !important; max-width: none !important; }
          .song-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 12px !important; }
          .song-card { padding: 12px !important; }
          .song-card-image { height: 120px !important; }
          .song-title { font-size: 13px !important; }
          .song-artist { font-size: 11px !important; }
          .bottom-player { padding: 0 8px env(safe-area-inset-bottom, 8px) 8px !important; height: calc(80px + env(safe-area-inset-bottom, 0px)) !important; }
          .player-controls { width: 50% !important; }
          .song-info { width: 35% !important; font-size: 11px !important; }
          .song-info div { max-width: 100px !important; }
          .volume-section { display: none !important; }
        }
        @media (max-width: 480px) {
          .main-content { padding: 4px !important; padding-top: 60px !important; padding-bottom: 85px !important; }
          .top-controls { top: 4px !important; right: 4px !important; }
          .top-controls button { width: 28px !important; height: 28px !important; }
          .header-section { margin-bottom: 12px !important; }
          .header-info h2 { font-size: 16px !important; }
          .home-card { padding: 12px !important; }
          .home-card-image { width: 100px !important; height: 100px !important; }
          .home-card-details h3 { font-size: 18px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; padding: 12px !important; }
          .song-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important; gap: 8px !important; }
          .song-card { padding: 8px !important; }
          .song-card-image { height: 100px !important; }
          .bottom-player { height: 70px !important; padding: 0 4px !important; }
          .player-controls { width: 45% !important; }
          .song-info { width: 30% !important; }
          .song-info div { max-width: 80px !important; font-size: 10px !important; }
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
        <div className="top-controls" style={{position: 'fixed', top: '16px', right: '16px', zIndex: 1001, display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <button 
            onClick={toggleTheme}
            style={{
              background: `rgba(${parseInt(getCurrentColor().slice(1,3), 16)}, ${parseInt(getCurrentColor().slice(3,5), 16)}, ${parseInt(getCurrentColor().slice(5,7), 16)}, 0.9)`,
              border: 'none',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d={isDarkTheme ? "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" : "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"} />
            </svg>
          </button>
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: `rgba(${parseInt(getCurrentColor().slice(1,3), 16)}, ${parseInt(getCurrentColor().slice(3,5), 16)}, ${parseInt(getCurrentColor().slice(5,7), 16)}, 0.9)`,
              border: 'none',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
          <div className="header-section" style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
            <div className="header-logo" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
              <svg width="clamp(12, 1.5vw, 16)" height="clamp(9, 1.2vw, 12)" viewBox="0 0 100 100" fill={getCurrentColor()}>
                <circle cx="50" cy="50" r="45" fill="none" stroke={getCurrentColor()} strokeWidth="3"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke={getCurrentColor()} strokeWidth="2"/>
                <circle cx="50" cy="50" r="25" fill="none" stroke={getCurrentColor()} strokeWidth="2"/>
                <circle cx="50" cy="50" r="8" fill={getCurrentColor()}/>
                <polygon points="42,35 42,65 65,50" fill={getCurrentColor()}/>
              </svg>
              <div style={{
                fontSize: 'clamp(6px, 1vw, 8px)',
                fontWeight: 'bold',
                color: getCurrentColor(),
                textShadow: `0 0 5px ${getCurrentColor()}, 0 0 10px ${getCurrentColor()}, 0 0 15px ${getCurrentColor()}`,
                letterSpacing: '1px',
                fontFamily: 'Arial, sans-serif',
                width: 'clamp(18px, 3vw, 24px)',
                textAlign: 'center'
              }}>GEEKIFY</div>
            </div>
            <div style={{flex: 1}}>
              <h2 style={{fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '300', margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic'}}>Hello Melophile</h2>
              <div className="user-controls" style={{display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '8px', background: serverStatus === 'online' ? 'rgba(34, 197, 94, 0.2)' : serverStatus === 'offline' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.2)', border: `1px solid ${serverStatus === 'online' ? '#22c55e' : serverStatus === 'offline' ? '#ef4444' : '#9ca3af'}`}}>
                  <div style={{width: '4px', height: '4px', borderRadius: '50%', background: serverStatus === 'online' ? '#22c55e' : serverStatus === 'offline' ? '#ef4444' : '#9ca3af'}}></div>
                  <span style={{fontSize: '10px', color: serverStatus === 'online' ? '#22c55e' : serverStatus === 'offline' ? '#ef4444' : '#9ca3af', fontWeight: '500'}}>
                    {serverStatus === 'checking' ? 'Checking...' : serverStatus === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
                {showInstallPrompt && (
                  <button 
                    onClick={handleInstallApp}
                    style={{background: getCurrentColor(), color: 'white', padding: '4px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: '500'}}
                  >
                    📱 Install App
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {activeMenu === 'Home' && (
            <div style={{textAlign: 'center', padding: '60px 20px'}}>
              <h2 style={{fontSize: '32px', fontWeight: '300', margin: '0 0 16px 0', color: getCurrentColor()}}>Welcome to Geekify</h2>
              <p style={{color: '#b3b3b3', fontSize: '16px', marginBottom: '40px'}}>Your music streaming experience starts here</p>
              
              {allSongs.length > 0 && (
                <div style={{background: '#181818', padding: '20px', borderRadius: '12px', maxWidth: '400px', margin: '0 auto'}}>
                  <h3 style={{fontSize: '18px', marginBottom: '12px', color: '#fff'}}>{allSongs[currentSong]?.title || 'No Song Selected'}</h3>
                  <p style={{color: '#b3b3b3', fontSize: '14px', marginBottom: '16px'}}>{allSongs[currentSong]?.artist || ''}</p>
                  <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
                    <button 
                      onClick={() => {
                        if (allSongs[currentSong]) {
                          setIsPlaying(!isPlaying);
                          if (!isPlaying) {
                            audioRef.current?.play();
                          } else {
                            audioRef.current?.pause();
                          }
                        }
                      }}
                      style={{background: getCurrentColor(), color: 'white', padding: '12px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    {!showInstallPrompt && (
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'Geekify Music App',
                              text: 'Install Geekify Music App',
                              url: window.location.href
                            });
                          } else {
                            alert('Add this page to your home screen to install the app!');
                          }
                        }}
                        style={{background: 'transparent', border: `1px solid ${getCurrentColor()}`, color: getCurrentColor(), padding: '12px 24px', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}
                      >
                        📱 Get App
                      </button>
                    )}
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
          
          {activeMenu === 'Our Songs' && (
            <div>
              <h3 style={{fontSize: '20px', margin: '0 0 24px 0'}}>Our Songs</h3>
              <p style={{color: '#b3b3b3', fontSize: '14px', marginBottom: '24px'}}>All available songs from GitHub and approved uploads</p>
              
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
                    justifyContent: 'space-between'
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

                  </div>
                )) : <div>Loading songs...</div>}
              </div>
            </div>
          )}
          

          
          {activeMenu === 'Your Library' && (
            <div style={{textAlign: 'center', padding: '60px 20px'}}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="#666" style={{marginBottom: '16px'}}>
                <path d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.464a1 1 0 0 1 .5-.866l6-3.464a1 1 0 0 1 1 0L12 3.732l2.5-1.598zM4 7.732V20h16V7.732l-5-2.887V8a1 1 0 0 1-2 0V4.845L9 7.732z"/>
              </svg>
              <p style={{color: '#b3b3b3', fontSize: '16px'}}>Get Mobile App</p>
              <p style={{color: '#666', fontSize: '14px', marginBottom: '24px'}}>Install Geekify for the best mobile experience</p>
              
              <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
                {showInstallPrompt ? (
                  <button 
                    onClick={handleInstallApp}
                    style={{background: getCurrentColor(), color: 'white', padding: '12px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}
                  >
                    📱 Install Now
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Geekify Music App',
                          text: 'Install Geekify Music App - Add to Home Screen',
                          url: window.location.href
                        });
                      } else {
                        alert('To install:\n\n📱 Android: Tap menu → "Add to Home Screen"\n🍎 iPhone: Tap share → "Add to Home Screen"');
                      }
                    }}
                    style={{background: getCurrentColor(), color: 'white', padding: '12px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}
                  >
                    📱 Add to Home Screen
                  </button>
                )}
              </div>
            </div>
          )}
          

          

          

          

          

        </div>
      </div>
      

      

      

      
      {/* Audio Element */}
      {allSongs[currentSong] && (
        <audio 
          ref={audioRef}
          src={allSongs[currentSong].url}
          onEnded={playNext}
          onLoadedData={() => {
            if (isPlaying) {
              audioRef.current?.play().catch(error => {
                console.log('Autoplay prevented:', error);
                setIsPlaying(false);
              });
            }
          }}
        />
      )}
      
      {/* Bottom Player */}
      <MusicPlayer 
        allSongs={allSongs}
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
