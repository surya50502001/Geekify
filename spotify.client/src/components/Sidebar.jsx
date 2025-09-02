const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🎵 My Library</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className="nav-item active">
            <span>🏠</span> Home
          </li>
          <li className="nav-item">
            <span>🔍</span> Search
          </li>
          <li className="nav-item">
            <span>📚</span> Your Library
          </li>
        </ul>
      </nav>
      <div className="playlists">
        <h3>Playlists</h3>
        <ul>
          <li>Liked Songs</li>
          <li>Recently Played</li>
          <li>My Playlist #1</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;