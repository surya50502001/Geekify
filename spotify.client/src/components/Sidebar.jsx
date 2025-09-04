function Sidebar({ activeMenu, setActiveMenu, setSidebarOpen, sidebarOpen, getCurrentColor, isDarkTheme, currentUser, isAdmin }) {
  return (
    <div className="sidebar" style={{width: sidebarOpen ? '240px' : '0', background: isDarkTheme ? '#000000' : '#f8f9fa', padding: sidebarOpen ? '24px 12px' : '0', borderRight: isDarkTheme ? '1px solid #282828' : '1px solid #e0e0e0', overflow: 'hidden', transition: 'width 0.3s ease, padding 0.3s ease, background-color 0.3s ease'}}>
      <div style={{marginBottom: '32px'}}>
        <h1 style={{fontSize: '20px', margin: 0, fontWeight: '600', color: getCurrentColor(), fontFamily: 'Arial, sans-serif'}}>Menu</h1>
      </div>
      <nav>
        <div onClick={() => {setActiveMenu('Home'); setSidebarOpen(false);}} style={{marginBottom: '8px', padding: '12px 16px', cursor: 'pointer', borderRadius: '4px', background: activeMenu === 'Home' ? `${getCurrentColor()}20` : 'transparent', display: 'flex', alignItems: 'center', gap: '16px', color: activeMenu === 'Home' ? getCurrentColor() : '#b3b3b3'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33z"/></svg>
          Home
        </div>
        <div onClick={() => {setActiveMenu('Search'); setSidebarOpen(false);}} style={{marginBottom: '8px', padding: '12px 16px', cursor: 'pointer', borderRadius: '4px', background: activeMenu === 'Search' ? `${getCurrentColor()}20` : 'transparent', display: 'flex', alignItems: 'center', gap: '16px', color: activeMenu === 'Search' ? getCurrentColor() : '#b3b3b3'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/></svg>
          Search
        </div>
        <div onClick={() => {setActiveMenu('Library'); setSidebarOpen(false);}} style={{marginBottom: '24px', padding: '12px 16px', cursor: 'pointer', borderRadius: '4px', background: activeMenu === 'Library' ? `${getCurrentColor()}20` : 'transparent', display: 'flex', alignItems: 'center', gap: '16px', color: activeMenu === 'Library' ? getCurrentColor() : '#b3b3b3'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.464a1 1 0 0 1 .5-.866l6-3.464a1 1 0 0 1 1 0L12 3.732l2.5-1.598zM4 7.732V20h16V7.732l-5-2.887V8a1 1 0 0 1-2 0V4.845L9 7.732z"/></svg>
          Your Library
        </div>
        <div onClick={() => {setActiveMenu('Liked'); setSidebarOpen(false);}} style={{marginBottom: '8px', padding: '12px 16px', cursor: 'pointer', borderRadius: '4px', background: activeMenu === 'Liked' ? `${getCurrentColor()}20` : 'transparent', display: 'flex', alignItems: 'center', gap: '16px', color: activeMenu === 'Liked' ? getCurrentColor() : '#b3b3b3'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          Liked Songs
        </div>
        {currentUser && (
          <div onClick={() => {setActiveMenu('Your Uploaded Songs'); setSidebarOpen(false);}} style={{marginBottom: '8px', padding: '12px 16px', cursor: 'pointer', borderRadius: '4px', background: activeMenu === 'Your Uploaded Songs' ? `${getCurrentColor()}20` : 'transparent', display: 'flex', alignItems: 'center', gap: '16px', color: activeMenu === 'Your Uploaded Songs' ? getCurrentColor() : '#b3b3b3'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
            Your Uploaded Songs
          </div>
        )}
        {isAdmin && (
          <div onClick={() => {setActiveMenu('Admin Panel'); setSidebarOpen(false);}} style={{marginBottom: '8px', padding: '12px 16px', cursor: 'pointer', borderRadius: '4px', background: activeMenu === 'Admin Panel' ? `${getCurrentColor()}20` : 'transparent', display: 'flex', alignItems: 'center', gap: '16px', color: activeMenu === 'Admin Panel' ? getCurrentColor() : '#b3b3b3'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Admin Panel
          </div>
        )}
      </nav>
    </div>
  );
}

export default Sidebar;