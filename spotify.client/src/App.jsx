import { useState } from 'react';

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div style={{height: '100vh', background: isDarkTheme ? '#000' : '#fff', color: isDarkTheme ? '#fff' : '#000', padding: '20px'}}>
      <h1 style={{color: '#1db954'}}>Geekify Music</h1>
      <p>Your music streaming app</p>
      <button onClick={toggleTheme} style={{background: '#1db954', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}>
        {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
}

export default App;