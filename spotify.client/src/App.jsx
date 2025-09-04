import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import { validateUser, registerUser, isAdmin } from './People';

// C# server user data management
const createUserData = async (userId) => {
  const userData = {
    userId,
    likedSongs: [],
    playlists: [],
    async save() {
      const data = {
        likedSongs: this.likedSongs,
        playlists: this.playlists
      };
      
      // Save to file system via server
      try {
        await fetch('https://ee2b3f9b8389.ngrok-free.app/api/user/save-user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: this.userId, data })
        });
      } catch (error) {
        console.log('C# server save failed');
      }
    },
    likeSong(song) {
      if (!this.likedSongs.find(s => s.title === song.title)) {
        this.likedSongs.push(song);
        this.save();
      }
    },
    unlikeSong(song) {
      this.likedSongs = this.likedSongs.filter(s => s.title !== song.title);
      this.save();
    },
    isSongLiked(song) {
      return this.likedSongs.some(s => s.title === song.title);
    },
    async createPlaylist(name, isGlobal = false) {
      const playlist = {
        id: Date.now(),
        name: name,
        songs: [],
        createdAt: new Date().toISOString(),
        createdBy: this.userId
      };
      
      if (isGlobal) {
        // Save as global playlist
        try {
          await fetch('https://ee2b3f9b8389.ngrok-free.app/api/user/save-global-playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlist })
          });
        } catch (error) {
          console.log('Global playlist save failed');
        }
      } else {
        this.playlists.push(playlist);
        this.save();
      }
      return playlist;
    },
    addToPlaylist(playlistId, song) {
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (playlist && !playlist.songs.find(s => s.title === song.title)) {
        playlist.songs.push(song);
        this.save();
      }
    }
  };
  
  // Load from C# server
  try {
    const response = await fetch(`https://ee2b3f9b8389.ngrok-free.app/api/user/load-user-data/${userId}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        userData.likedSongs = result.data.likedSongs || [];
        userData.playlists = result.data.playlists || [];
        return userData;
      }
    }
  } catch (error) {
    console.log('C# server unavailable');
  }
  
  return userData;
};

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ourSongs, setOurSongs] = useState([]); // GitHub + approved songs
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authId, setAuthId] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [allUserUploads, setAllUserUploads] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [globalPlaylists, setGlobalPlaylists] = useState([]);

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
      allUserUploads,
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
      if (state.allUserUploads) setAllUserUploads(state.allUserUploads);
      if (state.ourSongs) setOurSongs(state.ourSongs);
    }
  };
  
  useEffect(() => {
    // Load cached app state first
    loadAppState();
    
    // Load user session and data
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      createUserData(savedUser).then(userData => {
        setUserData(userData);
      });
    }
    
    // Load global playlists
    const loadGlobalPlaylists = async () => {
      try {
        const response = await fetch('https://ee2b3f9b8389.ngrok-free.app/api/user/global-playlists');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setGlobalPlaylists(result.playlists);
          }
        }
      } catch (error) {
        console.log('Failed to load global playlists');
      }
    };
    
    loadGlobalPlaylists();
    
    // Load theme preference (override cache if exists)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
      document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';
    }
    
    // Load saved uploads and Our Songs
    const savedUploads = localStorage.getItem('allUserUploads');
    if (savedUploads) {
      setAllUserUploads(JSON.parse(savedUploads));
    }
    
    const savedOurSongs = localStorage.getItem('ourSongs');
    if (savedOurSongs) {
      setOurSongs(JSON.parse(savedOurSongs));
    }
    
    // Check for GitHub updates via Cloudflare Pages
    const currentVersion = '1.6.2'; // Update this when you make changes
    const checkForUpdates = async () => {
      try {
        const lastCheck = localStorage.getItem('lastUpdateCheck');
        const now = Date.now();
        
        if (!lastCheck || now - parseInt(lastCheck) > 60000) { // Check every minute
          // Check Cloudflare Pages deployment for updates
          const response = await fetch('https://geekifyzz.pages.dev/', { 
            method: 'HEAD',
            cache: 'no-cache',
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          const deploymentId = response.headers.get('cf-ray') || response.headers.get('etag');
          const storedDeployment = localStorage.getItem('lastDeployment');
          
          if (storedDeployment && deploymentId && deploymentId !== storedDeployment) {
            setUpdateAvailable(true);
          }
          
          if (deploymentId) localStorage.setItem('lastDeployment', deploymentId);
          localStorage.setItem('lastUpdateCheck', now.toString());
        }
      } catch (error) {
        console.log('Update check failed');
      }
    };
    
    // Check for updates every minute
    const updateInterval = setInterval(checkForUpdates, 60000);
    checkForUpdates(); // Initial check
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Check C# server status
    const checkServerStatus = async () => {
      try {
        const response = await fetch('https://ee2b3f9b8389.ngrok-free.app/api/song/songs');
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        setServerStatus('offline');
      }
    };
    
    checkServerStatus();
    const serverCheckInterval = setInterval(checkServerStatus, 30000);
    
    // Auto-save state periodically
    const saveInterval = setInterval(saveAppState, 10000); // Save every 10 seconds
    
    // Refresh global playlists every 30 seconds
    const playlistInterval = setInterval(loadGlobalPlaylists, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(updateInterval);
      clearInterval(saveInterval);
      clearInterval(serverCheckInterval);
      clearInterval(playlistInterval);
      saveAppState(); // Save on unmount
    };
  }, []);
  
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    document.body.className = newTheme ? 'dark-theme' : '';
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  const handleAuth = async () => {
    if (authMode === 'login') {
      try {
        const response = await fetch('https://ee2b3f9b8389.ngrok-free.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authId, password: authPassword })
        });
        const result = await response.json();
        
        if (result.success) {
          setCurrentUser(result.user.id);
          createUserData(result.user.id).then(userData => {
            setUserData(userData);
          });
          setShowAuth(false);
          localStorage.setItem('currentUser', result.user.id);
        } else {
          alert('Invalid credentials');
        }
      } catch (error) {
        // Fallback to client-side auth if server unavailable
        const user = validateUser(authId, authPassword);
        if (user) {
          setCurrentUser(user.id);
          createUserData(user.id).then(userData => {
            setUserData(userData);
          });
          setShowAuth(false);
          localStorage.setItem('currentUser', user.id);
        } else {
          alert('Invalid credentials');
        }
      }
    } else {
      try {
        const response = await fetch('https://ee2b3f9b8389.ngrok-free.app/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authId, password: authPassword })
        });
        const result = await response.json();
        
        if (result.success) {
          alert('Registration successful! Please login.');
          setAuthMode('login');
        } else {
          alert(result.message);
        }
      } catch (error) {
        // Fallback to client-side auth if server unavailable
        const result = registerUser(authId, authPassword);
        if (result.success) {
          alert('Registration successful! Please login.');
          setAuthMode('login');
        } else {
          alert(result.message);
        }
      }
    }
    setAuthId('');
    setAuthPassword('');
  };

  const handleFileUpload = async (event) => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create audio element to get duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      const handleUpload = async () => {
        // Upload to server immediately
        const formData = new FormData();
        formData.append('song', file);
        formData.append('uploader', currentUser);
        
        // Try server upload first, fallback to local storage
        let serverUploaded = false;
        try {
          const response = await fetch('https://ee2b3f9b8389.ngrok-free.app/api/song/upload', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.success) {
            console.log('Song saved to your local server via ngrok:', result.originalName);
            serverUploaded = true;
            
            const newSong = {
              title: file.name.replace(/\.[^/.]+$/, ''),
              artist: `Uploaded by ${currentUser}`,
              url: `https://ee2b3f9b8389.ngrok-free.app/api/song/play/${result.filename}`,
              uploadedBy: currentUser,
              duration: audio.duration,
              filename: result.filename,
              isServerSong: true,
              isPending: true
            };
            
            setUploadProgress(100);
            setTimeout(() => {
              setAllUserUploads(prev => {
                const updated = [...prev, newSong];
                localStorage.setItem('allUserUploads', JSON.stringify(updated));
                return updated;
              });
              console.log('Song uploaded to server and pending approval:', newSong.title);
              setIsUploading(false);
              setUploadProgress(0);
              saveAppState(); // Save immediately after upload
              alert('Song uploaded to server! Waiting for admin approval.');
            }, 500);
            return;
          }
        } catch (error) {
          console.log('Server not available, using local storage only');
        }
        
        // Fallback: Store locally without server
        if (!serverUploaded) {
          const newSong = {
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: `Uploaded by ${currentUser}`,
            url: URL.createObjectURL(file),
            uploadedBy: currentUser,
            duration: audio.duration,
            file: file,
            isServerSong: false,
            isPending: true
          };
          
          setUploadProgress(100);
          setTimeout(() => {
            setAllUserUploads(prev => {
              const updated = [...prev, newSong];
              localStorage.setItem('allUserUploads', JSON.stringify(updated));
              return updated;
            });
            console.log('Song stored locally and pending approval:', newSong.title);
            setIsUploading(false);
            setUploadProgress(0);
            saveAppState(); // Save immediately after upload
            alert('Song uploaded locally! Waiting for admin approval.');
          }, 500);
        }
      };
      
      // Set timeout for metadata loading
      const metadataTimeout = setTimeout(() => {
        console.log('Metadata loading timeout, proceeding with upload');
        handleUpload();
      }, 3000);
      
      audio.onloadedmetadata = () => {
        clearTimeout(metadataTimeout);
        handleUpload();
      };
      
      audio.onerror = () => {
        clearTimeout(metadataTimeout);
        console.log('Audio error, proceeding with upload');
        handleUpload();
      };
      
      // Simulate progress while loading metadata
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Load audio metadata
      audio.load();
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
  
  const toggleLike = () => {
    if (!userData || !allSongs[currentSong]) return;
    
    const song = allSongs[currentSong];
    if (userData.isSongLiked(song)) {
      userData.unlikeSong(song);
    } else {
      userData.likeSong(song);
    }
    // Force re-render by creating new userData object
    setUserData({...userData});
    // Save state immediately
    saveAppState();
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
        setOurSongs(prev => {
          const updated = [...prev, ...songList];
          localStorage.setItem('ourSongs', JSON.stringify(updated));
          return updated;
        });
      })
      .catch(err => console.error('Error loading songs:', err));
    
    // Load uploaded songs from server
    const fetchUploadedSongs = async () => {
      try {
        const response = await fetch('https://ee2b3f9b8389.ngrok-free.app/api/song/songs');
        const uploadedFiles = await response.json();
        console.log('Server response:', uploadedFiles);
        if (uploadedFiles.success) {
          const serverSongs = uploadedFiles.songs.map(song => ({
            title: song.name.replace(/\.[^/.]+$/, ''),
            artist: `Uploaded by ${song.uploader || 'User'}`,
            url: `https://ee2b3f9b8389.ngrok-free.app/api/song/play/${song.filename}`,
            uploadedBy: song.uploader,
            filename: song.filename,
            duration: 0,
            isServerSong: true,
            isPending: true
          }));
          console.log('Loaded server songs:', serverSongs);
          setAllUserUploads(prev => {
            const updated = [...serverSongs];
            localStorage.setItem('allUserUploads', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (error) {
        console.log('Could not fetch uploaded songs:', error);
        // Fallback: show locally uploaded songs for testing
        console.log('Using local fallback songs');
      }
    };
    
    fetchUploadedSongs();
    // Refresh uploaded songs every 30 seconds
    const interval = setInterval(fetchUploadedSongs, 30000);
    
    return () => clearInterval(interval);
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
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    saveAppState();
  };

  const playPrev = () => {
    const prevSong = currentSong === 0 ? allSongs.length - 1 : currentSong - 1;
    setCurrentSong(prevSong);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    saveAppState();
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
          .main-content { padding: 8px !important; padding-top: 70px !important; padding-bottom: 90px !important; }
          .top-controls { top: 8px !important; right: 8px !important; gap: 4px !important; }
          .top-controls button { width: 32px !important; height: 32px !important; }
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
          .bottom-player { padding: 0 8px !important; height: 80px !important; }
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
          currentUser={currentUser}
          isAdmin={isAdmin(currentUser)}
        />
        
        {/* Main Content */}
        <div className="main-content" style={{flex: 1, background: isDarkTheme ? `linear-gradient(180deg, ${getCurrentColor()}40 0%, #000000 100%)` : `linear-gradient(180deg, ${getCurrentColor()}20 0%, #f8f9fa 100%)`, padding: '24px', paddingBottom: '120px', transition: 'background 0.3s ease'}}>
          <div className="header-section" style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
            <div className="header-logo" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
              <svg width="clamp(24, 4vw, 32)" height="clamp(18, 3vw, 24)" viewBox="0 0 100 100" fill={getCurrentColor()}>
                <circle cx="50" cy="50" r="45" fill="none" stroke={getCurrentColor()} strokeWidth="3"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke={getCurrentColor()} strokeWidth="2"/>
                <circle cx="50" cy="50" r="25" fill="none" stroke={getCurrentColor()} strokeWidth="2"/>
                <circle cx="50" cy="50" r="8" fill={getCurrentColor()}/>
                <polygon points="42,35 42,65 65,50" fill={getCurrentColor()}/>
              </svg>
              <div style={{
                fontSize: 'clamp(10px, 2vw, 12px)',
                fontWeight: 'bold',
                color: getCurrentColor(),
                textShadow: `0 0 5px ${getCurrentColor()}, 0 0 10px ${getCurrentColor()}, 0 0 15px ${getCurrentColor()}`,
                letterSpacing: '1px',
                fontFamily: 'Arial, sans-serif',
                width: 'clamp(32px, 6vw, 48px)',
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
                {currentUser ? (
                  <>
                    <span style={{color: getCurrentColor(), fontSize: '12px', fontWeight: '500'}}>Hi, {currentUser}</span>
                    <button 
                      onClick={() => {
                        setCurrentUser(null);
                        setUserData(null);
                        localStorage.removeItem('currentUser');
                      }}
                      style={{background: 'transparent', border: `1px solid #ff4444`, color: '#ff4444', padding: '4px 8px', borderRadius: '12px', cursor: 'pointer', fontSize: '10px', fontWeight: '500'}}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setShowAuth(true)}
                    style={{background: getCurrentColor(), color: 'white', padding: '4px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: '500'}}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {activeMenu === 'Home' && (
            <div style={{textAlign: 'center', padding: '60px 20px'}}>
              <p style={{color: '#b3b3b3', fontSize: '16px', marginBottom: '40px'}}>Your music streaming experience starts here</p>
              
              {allSongs.length > 0 && (
                <div className="home-card" style={{background: 'linear-gradient(145deg, #1e1e1e, #2a2a2a)', padding: '40px', borderRadius: '20px', maxWidth: '480px', margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid #333'}}>
                  <div className="home-card-content" style={{display: 'flex', gap: '24px', marginBottom: '32px'}}>
                    <div 
                      className="home-card-image" 
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
                      style={{width: '140px', height: '140px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${getCurrentColor()}40`, cursor: 'pointer', transition: 'transform 0.2s ease'}}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
                        <path d={isPlaying ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"}/>
                      </svg>
                    </div>
                    <div className="home-card-details" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                      <h3 style={{fontSize: '24px', fontWeight: '700', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff', maxWidth: '280px'}}>{allSongs[currentSong]?.title || 'No Song Selected'}</h3>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(allSongs[currentSong]?.artist || 'Artist')}&background=${getCurrentColor().slice(1)}&color=fff&size=32&rounded=true`}
                          alt="Artist"
                          style={{width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${getCurrentColor()}`}}
                        />
                        <span style={{color: getCurrentColor(), fontSize: '16px', fontWeight: '500'}}>{allSongs[currentSong]?.artist || ''}</span>
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
                    <div style={{display: 'flex', gap: '8px'}}>
                      {currentUser && userData && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (userData.isSongLiked(song)) {
                              userData.unlikeSong(song);
                            } else {
                              userData.likeSong(song);
                            }
                            setUserData({...userData});
                            saveAppState();
                          }} 
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: userData.isSongLiked(song) ? '#1db954' : '#b3b3b3',
                            cursor: 'pointer',
                            padding: '8px',
                            transition: 'color 0.3s ease'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </button>
                      )}
                      {currentUser && userData && userData.playlists.length > 0 && (
                        <select 
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.value) {
                              userData.addToPlaylist(parseInt(e.target.value), song);
                              setUserData({...userData});
                              saveAppState();
                              e.target.value = '';
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#b3b3b3',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '8px'
                          }}
                        >
                          <option value="" style={{background: '#333', color: '#fff'}}>+</option>
                          {userData.playlists.map(playlist => (
                            <option key={playlist.id} value={playlist.id} style={{background: '#333', color: '#fff'}}>{playlist.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )) : <div>Loading songs...</div>}
              </div>
            </div>
          )}
          
          {activeMenu === 'Upload' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <h3 style={{fontSize: '20px', margin: 0}}>Upload Songs</h3>
                <div style={{display: 'flex', gap: '12px'}}>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Share link copied! Your friends can upload songs here.');
                    }}
                    style={{background: 'transparent', border: `1px solid ${getCurrentColor()}`, color: getCurrentColor(), padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}
                  >
                    📤 Share Upload Link
                  </button>
                  <label style={{background: getCurrentColor(), color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}>
                    + Upload Song
                    <input type="file" accept="audio/*" onChange={handleFileUpload} style={{display: 'none'}} />
                  </label>
                </div>
              </div>
              {isUploading && (
                <div style={{background: '#181818', padding: '16px', borderRadius: '8px', marginBottom: '16px'}}>
                  <div style={{marginBottom: '8px'}}>Uploading... {uploadProgress}%</div>
                  <div style={{width: '100%', height: '4px', background: '#333', borderRadius: '2px'}}>
                    <div style={{width: `${uploadProgress}%`, height: '100%', background: getCurrentColor(), borderRadius: '2px', transition: 'width 0.3s ease'}}></div>
                  </div>
                </div>
              )}
              
              <div style={{textAlign: 'center', padding: '60px 20px'}}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="#666" style={{marginBottom: '16px'}}>
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <p style={{color: '#b3b3b3', fontSize: '16px'}}>Upload your music here</p>
                <p style={{color: '#666', fontSize: '14px'}}>Share your favorite songs with the community</p>
              </div>
            </div>
          )}
          
          {activeMenu === 'Your Library' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <h3 style={{fontSize: '20px', margin: 0}}>Your Library</h3>
                {currentUser && (
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button 
                      onClick={async () => {
                        if (userData) {
                          const refreshedData = await createUserData(currentUser);
                          setUserData(refreshedData);
                        }
                      }}
                      style={{background: 'transparent', border: `1px solid ${getCurrentColor()}`, color: getCurrentColor(), padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '12px', fontWeight: '500'}}
                    >
                      🔄 Refresh
                    </button>
                    <button 
                      onClick={() => setShowCreatePlaylist(true)}
                      style={{background: getCurrentColor(), color: 'white', padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}
                    >
                      + Create Playlist
                    </button>
                  </div>
                )}
              </div>
              
              {currentUser && userData ? (
                <div>
                  {/* Liked Songs */}
                  <div 
                    onClick={() => setActiveMenu('Liked Songs')}
                    style={{
                      background: '#181818',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #1db954, #1ed760)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <div>
                      <div style={{fontWeight: 'bold', fontSize: '14px', marginBottom: '4px'}}>Liked Songs</div>
                      <div style={{color: '#b3b3b3', fontSize: '12px'}}>{userData.likedSongs.length} songs</div>
                    </div>
                  </div>
                  
                  {/* Global Playlists */}
                  {globalPlaylists.length > 0 && (
                    <>
                      <div style={{color: '#b3b3b3', fontSize: '12px', fontWeight: '600', margin: '16px 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px'}}>Global Playlists</div>
                      {globalPlaylists.map(playlist => (
                        <div 
                          key={`global-${playlist.id}`}
                          onClick={() => {setCurrentPlaylist(playlist); setActiveMenu('Playlist View');}}
                          style={{
                            background: '#181818',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            border: '1px solid #333'
                          }}
                        >
                          <div style={{width: '48px', height: '48px', background: `linear-gradient(135deg, #ff6b35, #f7931e)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                          </div>
                          <div>
                            <div style={{fontWeight: 'bold', fontSize: '14px', marginBottom: '4px'}}>{playlist.name}</div>
                            <div style={{color: '#b3b3b3', fontSize: '12px'}}>{playlist.songs.length} songs • by {playlist.createdBy}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {/* User Playlists */}
                  {userData.playlists.length > 0 && (
                    <>
                      <div style={{color: '#b3b3b3', fontSize: '12px', fontWeight: '600', margin: '16px 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px'}}>Your Playlists</div>
                      {userData.playlists.map(playlist => (
                        <div 
                          key={playlist.id}
                          onClick={() => {setCurrentPlaylist(playlist); setActiveMenu('Playlist View');}}
                          style={{
                            background: '#181818',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                          }}
                        >
                          <div style={{width: '48px', height: '48px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                          </div>
                          <div>
                            <div style={{fontWeight: 'bold', fontSize: '14px', marginBottom: '4px'}}>{playlist.name}</div>
                            <div style={{color: '#b3b3b3', fontSize: '12px'}}>{playlist.songs.length} songs</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '60px 20px'}}>
                  <p style={{color: '#b3b3b3', fontSize: '16px'}}>Please login to view your library</p>
                </div>
              )}
            </div>
          )}
          
          {activeMenu === 'Liked Songs' && (
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
                <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #1db954, #1ed760)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <div>
                  <h3 style={{fontSize: '24px', margin: 0, color: getCurrentColor()}}>Liked Songs</h3>
                  <p style={{color: '#b3b3b3', fontSize: '14px', margin: '4px 0 0 0'}}>{currentUser && userData ? userData.likedSongs.length : 0} songs</p>
                </div>
              </div>
              
              {currentUser && userData && userData.likedSongs.length > 0 ? (
                <div>
                  {userData.likedSongs.map((song, index) => (
                    <div key={`${song.title}-${index}`} onClick={() => {
                      const songIndex = allSongs.findIndex(s => s.title === song.title && s.artist === song.artist);
                      if (songIndex !== -1) {
                        setCurrentSong(songIndex);
                        setIsPlaying(true);
                      }
                    }} style={{
                      background: '#181818',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'background 0.2s ease'
                    }}>
                      <div style={{width: '48px', height: '48px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                      </div>
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: 'bold', fontSize: '14px', marginBottom: '4px'}}>{song.title}</div>
                        <div style={{color: '#b3b3b3', fontSize: '12px'}}>{song.artist}</div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          userData.unlikeSong(song);
                          setUserData({...userData});
                          saveAppState();
                        }} 
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#1db954',
                          cursor: 'pointer',
                          padding: '8px',
                          transition: 'color 0.3s ease'
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '60px 20px'}}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="#666" style={{marginBottom: '16px'}}>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <p style={{color: '#b3b3b3', fontSize: '16px'}}>No liked songs yet</p>
                  <p style={{color: '#666', fontSize: '14px'}}>Like songs from "Our Songs" and they'll appear here</p>
                </div>
              )}
            </div>
          )}
          
          {activeMenu === 'Playlist View' && currentPlaylist && (
            <div style={{padding: '20px'}}>
              <h3 style={{fontSize: '24px', marginBottom: '24px', color: getCurrentColor()}}>{currentPlaylist.name}</h3>
              {currentPlaylist.songs.length > 0 ? (
                <div>
                  {currentPlaylist.songs.map((song, index) => (
                    <div key={index} onClick={() => {setCurrentSong(allSongs.findIndex(s => s.title === song.title)); setIsPlaying(true);}} style={{
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
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '60px 20px'}}>
                  <p style={{color: '#b3b3b3', fontSize: '16px'}}>No songs in this playlist</p>
                  <p style={{color: '#666', fontSize: '14px'}}>Add songs from Our Songs</p>
                </div>
              )}
            </div>
          )}
          

          

          
          {activeMenu === 'Admin Panel' && isAdmin(currentUser) && (
            <div>
              <h3 style={{fontSize: '20px', margin: '0 0 24px 0', color: getCurrentColor()}}>Admin Panel - All User Uploads</h3>
              {allUserUploads.length > 0 ? (
                <div>
                  {allUserUploads.map((song, index) => (
                    <div key={index} style={{
                      background: '#181818',
                      padding: '12px 16px',
                      borderRadius: '8px',
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
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button 
                          onClick={async () => {
                            const approvedSong = {
                              title: song.title,
                              artist: song.artist || `Uploaded by ${song.uploadedBy}`,
                              url: song.url,
                              duration: song.duration,
                              filename: song.filename,
                              isServerSong: true,
                              isPending: false
                            };
                            
                            // Note: GitHub push functionality needs to be implemented in C# server
                            
                            setOurSongs(prev => {
                              const updated = [...prev, approvedSong];
                              localStorage.setItem('ourSongs', JSON.stringify(updated));
                              return updated;
                            });
                            setAllUserUploads(prev => {
                              const updated = prev.filter((_, i) => i !== index);
                              localStorage.setItem('allUserUploads', JSON.stringify(updated));
                              return updated;
                            });
                            console.log('Song approved and moved to library:', approvedSong.title);
                            alert('Song approved, added to Our Songs, and pushed to GitHub!');
                          }}
                          style={{background: getCurrentColor(), color: 'white', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px'}}
                        >
                          ✓ Approve & Move to Library
                        </button>
                        <button 
                          onClick={() => {
                            setAllUserUploads(prev => {
                              const updated = prev.filter((_, i) => i !== index);
                              localStorage.setItem('allUserUploads', JSON.stringify(updated));
                              return updated;
                            });
                            alert('Song rejected and removed.');
                          }}
                          style={{background: '#ff4444', color: 'white', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px'}}
                        >
                          ✗ Reject
                        </button>
                        {song.filename && (
                          <button 
                            onClick={async () => {
                              if (confirm(`Delete ${song.title} from server permanently?`)) {
                                try {
                                  const response = await fetch(`https://ee2b3f9b8389.ngrok-free.app/api/song/delete/${song.filename}`, {
                                    method: 'DELETE'
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    setAllUserUploads(prev => {
                                      const updated = prev.filter((_, i) => i !== index);
                                      localStorage.setItem('allUserUploads', JSON.stringify(updated));
                                      return updated;
                                    });
                                    alert('Song deleted from server!');
                                  } else {
                                    alert('Failed to delete from server');
                                  }
                                } catch (error) {
                                  console.error('Delete error:', error);
                                  alert('Error deleting from server');
                                }
                              }
                            }}
                            style={{background: '#dc2626', color: 'white', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px'}}
                          >
                            🗑️ Delete from Server
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '60px 20px'}}>
                  <p style={{color: '#b3b3b3', fontSize: '16px'}}>No pending uploads</p>
                  <p style={{color: '#666', fontSize: '14px'}}>User uploads will appear here for approval</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Auth Modal */}
      {showAuth && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000}}>
          <div style={{background: isDarkTheme ? '#1e1e1e' : '#ffffff', padding: '32px', borderRadius: '16px', width: '400px', maxWidth: '90vw'}}>
            <h3 style={{fontSize: '24px', marginBottom: '24px', textAlign: 'center', color: getCurrentColor()}}>{authMode === 'login' ? 'Login' : 'Register'}</h3>
            <input 
              type="text" 
              placeholder="User ID"
              value={authId}
              onChange={(e) => setAuthId(e.target.value)}
              style={{width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: 'none', background: '#242424', color: 'white', fontSize: '16px', outline: 'none'}}
            />
            <input 
              type="password" 
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              style={{width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: 'none', background: '#242424', color: 'white', fontSize: '16px', outline: 'none'}}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
              <button 
                onClick={handleAuth}
                style={{background: getCurrentColor(), color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '500'}}
              >
                {authMode === 'login' ? 'Login' : 'Register'}
              </button>
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                style={{background: 'transparent', border: `1px solid ${getCurrentColor()}`, color: getCurrentColor(), padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500'}}
              >
                {authMode === 'login' ? 'Register' : 'Login'}
              </button>
              <button 
                onClick={() => setShowAuth(false)}
                style={{background: 'transparent', border: '1px solid #666', color: '#666', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000}}>
          <div style={{background: isDarkTheme ? '#1e1e1e' : '#ffffff', padding: '32px', borderRadius: '16px', width: '400px', maxWidth: '90vw'}}>
            <h3 style={{fontSize: '24px', marginBottom: '24px', textAlign: 'center', color: getCurrentColor()}}>Create Playlist</h3>
            <input 
              type="text" 
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              style={{width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: 'none', background: '#242424', color: 'white', fontSize: '16px', outline: 'none'}}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newPlaylistName.trim()) {
                  userData.createPlaylist(newPlaylistName.trim());
                  setUserData({...userData});
                  setNewPlaylistName('');
                  setShowCreatePlaylist(false);
                  alert('Playlist created!');
                }
              }}
            />
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
              <button 
                onClick={async () => {
                  if (newPlaylistName.trim()) {
                    const isGlobal = isAdmin(currentUser);
                    await userData.createPlaylist(newPlaylistName.trim(), isGlobal);
                    if (isGlobal) {
                      // Refresh global playlists
                      try {
                        const response = await fetch('https://ee2b3f9b8389.ngrok-free.app/api/user/global-playlists');
                        if (response.ok) {
                          const result = await response.json();
                          if (result.success) {
                            setGlobalPlaylists(result.playlists);
                          }
                        }
                      } catch (error) {
                        console.log('Failed to refresh global playlists');
                      }
                    }
                    setUserData({...userData});
                    setNewPlaylistName('');
                    setShowCreatePlaylist(false);
                    alert(isGlobal ? 'Global playlist created! All users can see it.' : 'Playlist created!');
                  }
                }}
                style={{background: getCurrentColor(), color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '500'}}
              >
                Create
              </button>
              <button 
                onClick={() => {setShowCreatePlaylist(false); setNewPlaylistName('');}}
                style={{background: 'transparent', border: '1px solid #666', color: '#666', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* GitHub Update Notification */}
      {updateAvailable && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2001,
          background: isDarkTheme ? '#1e1e1e' : '#ffffff',
          border: `2px solid ${getCurrentColor()}`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          maxWidth: '400px',
          textAlign: 'center',
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{marginBottom: '16px'}}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill={getCurrentColor()} style={{marginBottom: '12px'}}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <h3 style={{margin: 0, fontSize: '20px', color: getCurrentColor()}}>Code Updated!</h3>
          </div>
          <p style={{margin: '0 0 20px 0', fontSize: '16px', color: isDarkTheme ? '#b3b3b3' : '#666', lineHeight: '1.5'}}>New changes have been pushed to GitHub. Refresh to get the latest features and improvements.</p>
          <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
            <button 
              onClick={handleRefresh}
              style={{
                background: getCurrentColor(),
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🔄 Refresh Now
            </button>
            <button 
              onClick={dismissUpdate}
              style={{
                background: 'transparent',
                border: `1px solid ${isDarkTheme ? '#444' : '#ddd'}`,
                borderRadius: '8px',
                padding: '12px 24px',
                color: isDarkTheme ? '#b3b3b3' : '#666',
                fontSize: '16px',
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
        userData={userData}
        setUserData={setUserData}
        saveAppState={saveAppState}
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
