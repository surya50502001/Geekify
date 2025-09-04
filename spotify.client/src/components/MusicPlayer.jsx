function MusicPlayer({ 
  allSongs, 
  currentSong, 
  isPlaying, 
  currentTime, 
  duration, 
  userData,
  audioRef,
  getCurrentColor,
  formatTime,
  handleProgressClick,
  playPrev,
  togglePlay,
  playNext,
  toggleLike
}) {
  return (
    <div className="bottom-player" style={{position: 'fixed', bottom: 0, left: 0, right: 0, height: '90px', background: `linear-gradient(90deg, #181818, ${getCurrentColor()}15)`, borderTop: `1px solid ${getCurrentColor()}40`, display: 'flex', alignItems: 'center', padding: '0 16px'}}>
      <audio ref={audioRef} src={allSongs[currentSong]?.url} preload="metadata" />
      
      {/* Song Info */}
      <div className="song-info" style={{display: 'flex', alignItems: 'center', width: '30%'}}>
        <div style={{width: '64px', height: '48px', background: `linear-gradient(135deg, ${getCurrentColor()}, ${getCurrentColor()}dd)`, borderRadius: '8px', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
        </div>
        <div>
          <div style={{fontSize: '14px', fontWeight: '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px'}}>{allSongs[currentSong]?.title || 'Loading...'}</div>
          <div style={{fontSize: '11px', color: '#b3b3b3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px'}}>{allSongs[currentSong]?.artist || ''}</div>
        </div>
      </div>
      
      {/* Player Controls */}
      <div className="player-controls" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%'}}>
        <div style={{display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px'}}>
          <button onClick={playPrev} style={{background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '8px'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button onClick={togglePlay} style={{background: getCurrentColor(), border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {isPlaying ? 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            }
          </button>
          <button onClick={playNext} style={{background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '8px'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
          <button onClick={toggleLike} style={{background: 'transparent', border: 'none', color: userData && allSongs[currentSong] && userData.isSongLiked(allSongs[currentSong]) ? getCurrentColor() : '#b3b3b3', cursor: 'pointer', padding: '8px', transition: 'color 0.3s ease'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div style={{display: 'flex', alignItems: 'center', width: '100%', gap: '12px'}}>
          <span style={{fontSize: '11px', color: '#b3b3b3', minWidth: '40px'}}>{formatTime(currentTime)}</span>
          <div onClick={handleProgressClick} style={{flex: 1, height: '4px', background: '#4f4f4f', borderRadius: '2px', cursor: 'pointer', position: 'relative'}}>
            <div style={{height: '100%', background: getCurrentColor(), borderRadius: '2px', width: `${duration ? (currentTime / duration) * 100 : 0}%`}}></div>
          </div>
          <span style={{fontSize: '11px', color: '#b3b3b3', minWidth: '40px'}}>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Volume */}
      <div className="volume-section" style={{width: '30%', display: 'flex', justifyContent: 'flex-end'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
      </div>
    </div>
  );
}

export default MusicPlayer;