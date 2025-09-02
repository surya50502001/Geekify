import { useState, useRef, useEffect } from 'react';

const MusicPlayer = () => {
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  const songs = [
    {
      id: 1,
      title: "Fight Back",
      artist: "Neffex",
      url: "https://raw.githubusercontent.com/suryaansh2002/music-files/main/blinding-lights.mp3",
      cover: "https://raw.githubusercontent.com/suryaansh2002/music-files/main/covers/blinding-lights.jpg"
    },
    {
      id: 2,
      title: "Shape of You",
      artist: "Ed Sheeran",
      url: "https://raw.githubusercontent.com/suryaansh2002/music-files/main/shape-of-you.mp3",
      cover: "https://raw.githubusercontent.com/suryaansh2002/music-files/main/covers/shape-of-you.jpg"
    },
    {
      id: 3,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      url: "https://raw.githubusercontent.com/suryaansh2002/music-files/main/watermelon-sugar.mp3",
      cover: "https://raw.githubusercontent.com/suryaansh2002/music-files/main/covers/watermelon-sugar.jpg"
    }
  ];

  useEffect(() => {
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', nextSong);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', nextSong);
    };
  }, [nextSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    setCurrentSong((prev) => (prev + 1) % songs.length);
    setIsPlaying(false);
  };

  const prevSong = () => {
    setCurrentSong((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="music-player">
      <div className="now-playing">
        <img 
          src={songs[currentSong].cover} 
          alt={songs[currentSong].title}
          className="album-cover"
        />
        <div className="song-info">
          <h2>{songs[currentSong].title}</h2>
          <p>{songs[currentSong].artist}</p>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={songs[currentSong].url}
        preload="metadata"
      />

      <div className="player-controls">
        <div className="control-buttons">
          <button onClick={prevSong} className="control-btn">⏮</button>
          <button onClick={togglePlay} className="play-btn">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={nextSong} className="control-btn">⏭</button>
        </div>

        <div className="progress-container">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="progress-bar"
          />
          <span className="time">{formatTime(duration)}</span>
        </div>

        <div className="volume-container">
          <span>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="volume-bar"
          />
        </div>
      </div>

      <div className="playlist">
        <h3>Queue</h3>
        {songs.map((song, index) => (
          <div
            key={song.id}
            className={`playlist-item ${index === currentSong ? 'active' : ''}`}
            onClick={() => {
              setCurrentSong(index);
              setIsPlaying(false);
            }}
          >
            <img src={song.cover} alt={song.title} className="playlist-cover" />
            <div className="playlist-info">
              <span className="playlist-title">{song.title}</span>
              <span className="playlist-artist">{song.artist}</span>
            </div>
            {index === currentSong && isPlaying && <span className="playing-indicator">♪</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicPlayer;