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
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const playPrev = () => {
    const prevSong = currentSong === 0 ? allSongs.length - 1 : currentSong - 1;
    setCurrentSong(prevSong);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  if (isLoading) {
    return (
      <div style={{background: 'linear-gradient(135deg, #000 0%, #1a1a2e 50%, #16213e 100%)', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${spinnerColor}`,
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>Loading Spotify...</h2>
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
      <div style={{display: 'flex', flex: 1}}>
        <Sidebar 
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          getCurrentColor={getCurrentColor}
          isDarkTheme={isDarkTheme}
        />
        
        <div className="main-content" style={{flex: 1, background: isDarkTheme ? `linear-gradient(180deg, ${getCurrentColor()}40 0%, #000000 100%)` : `linear-gradient(180deg, ${getCurrentColor()}20 0%, #f8f9fa 100%)`, padding: '24px', paddingBottom: '120px', transition: 'background 0.3s ease'}}>
          <h2 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '24px'}}>Hello Melophile</h2>
          <div style={{textAlign: 'center', padding: '60px 20px'}}>
            <h3 style={{fontSize: '24px', marginBottom: '16px'}}>Welcome!</h3>
            <p style={{color: '#b3b3b3', fontSize: '16px', marginBottom: '40px'}}>Your music streaming experience starts here</p>
          </div>
        </div>
      </div>
      
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