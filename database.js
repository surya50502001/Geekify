const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'geekify.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS user_data (
    userId TEXT PRIMARY KEY,
    likedSongs TEXT DEFAULT '[]',
    playlists TEXT DEFAULT '[]',
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Save user data
const saveUserData = (userId, data) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO user_data (userId, likedSongs, playlists, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`);
    stmt.run([userId, JSON.stringify(data.likedSongs), JSON.stringify(data.playlists)], function(err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
    stmt.finalize();
  });
};

// Load user data
const loadUserData = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM user_data WHERE userId = ?`, [userId], (err, row) => {
      if (err) reject(err);
      else if (row) {
        resolve({
          success: true,
          data: {
            likedSongs: JSON.parse(row.likedSongs || '[]'),
            playlists: JSON.parse(row.playlists || '[]')
          }
        });
      } else {
        resolve({ success: true, data: { likedSongs: [], playlists: [] } });
      }
    });
  });
};

module.exports = { saveUserData, loadUserData };