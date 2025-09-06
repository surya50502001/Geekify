import { useState, useEffect } from 'react';

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    // Fix mobile viewport
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    // Prevent zoom on input focus
    document.addEventListener('touchstart', () => {}, { passive: true });
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div style={{
      height: '100vh', 
      background: isDarkTheme ? '#000' : '#fff', 
      color: isDarkTheme ? '#fff' : '#000', 
      padding: '20px',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{color: '#1db954', fontSize: 'clamp(24px, 8vw, 48px)', margin: '0 0 16px 0'}}>Geekify Music</h1>
      <p style={{fontSize: 'clamp(14px, 4vw, 18px)', margin: '0 0 24px 0'}}>Your music streaming app</p>
      <button 
        onClick={toggleTheme} 
        style={{
          background: '#1db954', 
          color: '#fff', 
          border: 'none', 
          padding: '12px 24px', 
          borderRadius: '8px', 
          cursor: 'pointer',
          fontSize: '16px',
          minHeight: '44px',
          minWidth: '120px'
        }}
      >
        {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
}

export default App;