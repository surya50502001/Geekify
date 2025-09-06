function Sidebar({ activeMenu, setActiveMenu, setSidebarOpen, sidebarOpen, getCurrentColor, isDarkTheme }) {
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
        <div onClick={() => {setActiveMenu('Our Songs'); setSidebarOpen(false);}} style={{marginBottom: '24px', padding: '12px 16px', cursor: 'pointer', borderRadius: '4px', background: activeMenu === 'Our Songs' ? `${getCurrentColor()}20` : 'transparent', display: 'flex', alignItems: 'center', gap: '16px', color: activeMenu === 'Our Songs' ? getCurrentColor() : '#b3b3b3'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          Our Songs
        </div>
        <div onClick={() => {setActiveMenu('Your Library'); setSidebarOpen(false);}} style={{marginBottom: '8px', padding: '12px 16px', cursor: 'pointer', borderRadius: '4px', background: activeMenu === 'Your Library' ? `${getCurrentColor()}20` : 'transparent', display: 'flex', alignItems: 'center', gap: '16px', color: activeMenu === 'Your Library' ? getCurrentColor() : '#b3b3b3'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.464a1 1 0 0 1 .5-.866l6-3.464a1 1 0 0 1 1 0L12 3.732l2.5-1.598zM4 7.732V20h16V7.732l-5-2.887V8a1 1 0 0 1-2 0V4.845L9 7.732z"/></svg>
          Your Library
        </div>
        <div onClick={() => {setActiveMenu('Messages'); setSidebarOpen(false);}} style={{marginBottom: '8px', padding: '12px 16px', cursor: 'pointer', borderRadius: '4px', background: activeMenu === 'Messages' ? `${getCurrentColor()}20` : 'transparent', display: 'flex', alignItems: 'center', gap: '16px', color: activeMenu === 'Messages' ? getCurrentColor() : '#b3b3b3'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
          Messages
        </div>

      </nav>
    </div>
  );
}

export default Sidebar;