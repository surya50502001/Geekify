import { useState, useEffect, useRef } from 'react';

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef(null);

  const songs = [
    { id: 1, title: 'Song 1', artist: 'Artist 1', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    { id: 2, title: 'Song 2', artist: 'Artist 2', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    { id: 3, title: 'Song 3', artist: 'Artist 3', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }
  ];

  useEffect(() => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  const playSong = (song) => {
    setCurrentSong(song);
    setShowPlayer(true);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 100);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const goBack = () => {
    setShowPlayer(false);
    setCurrentSong(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  if (showPlayer && currentSong) {
    return (
      <div style={{
        height: '100vh',
        background: isDarkTheme ? '#000' : '#fff',
        color: isDarkTheme ? '#fff' : '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center'
      }}>
        <button 
          onClick={goBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'transparent',
            border: 'none',
            color: isDarkTheme ? '#fff' : '#000',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>

        <div style={{
          width: '200px',
          height: '200px',
          background: '#1db954',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>

        <h2 style={{fontSize: '24px', margin: '0 0 10px 0'}}>{currentSong.title}</h2>
        <p style={{fontSize: '16px', color: '#888', margin: '0 0 30px 0'}}>{currentSong.artist}</p>

        <button
          onClick={togglePlay}
          style={{
            background: '#1db954',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        <audio ref={audioRef} src={currentSong.url} />
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      background: isDarkTheme ? '#000' : '#fff',
      color: isDarkTheme ? '#fff' : '#000',
      padding: '20px'
    }}>
      <h1 style={{color: '#1db954', textAlign: 'center', marginBottom: '30px'}}>Geekify Music</h1>
      
      <div style={{maxWidth: '400px', margin: '0 auto'}}>
        {songs.map(song => (
          <div 
            key={song.id}
            onClick={() => playSong(song)}
            style={{
              background: isDarkTheme ? '#181818' : '#f5f5f5',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              background: '#1db954',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div>
              <div style={{fontWeight: 'bold', fontSize: '16px'}}>{song.title}</div>
              <div style={{color: '#888', fontSize: '14px'}}>{song.artist}</div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setIsDarkTheme(!isDarkTheme)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#1db954',
          color: '#fff',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '25px',
          cursor: 'pointer'
        }}
      >
        {isDarkTheme ? '☀️' : '🌙'}
      </button>
    </div>
  );
}

export default App;