import { useState, useRef } from 'react';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  const song = {
    title: "GitHub Song",
    artist: "Your Artist",
    url: "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/path/to/song.mp3"
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{background: '#121212', color: 'white', padding: '20px', minHeight: '100vh', fontFamily: 'Arial'}}>
      <h1>🎵 Spotify Clone</h1>
      
      <div style={{background: '#1e1e1e', padding: '20px', borderRadius: '10px', marginTop: '20px'}}>
        <h2>{song.title}</h2>
        <p style={{color: '#b3b3b3'}}>{song.artist}</p>
        
        <audio ref={audioRef} src={song.url} />
        
        <button 
          onClick={togglePlay}
          style={{
            background: '#1db954',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>
    </div>
  );
}

export default App;