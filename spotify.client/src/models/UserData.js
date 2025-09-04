// User data model for persistent storage
export class UserData {
  constructor(userId) {
    this.userId = userId;
    this.likedSongs = [];
    this.playlists = [];
  }

  save() {
    localStorage.setItem(`userData_${this.userId}`, JSON.stringify({
      likedSongs: this.likedSongs,
      playlists: this.playlists
    }));
  }

  static load(userId) {
    const userData = new UserData(userId);
    const saved = localStorage.getItem(`userData_${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      userData.likedSongs = data.likedSongs || [];
      userData.playlists = data.playlists || [];
    }
    return userData;
  }

  likeSong(song) {
    if (!this.likedSongs.find(s => s.title === song.title)) {
      this.likedSongs.push(song);
      this.save();
    }
  }

  unlikeSong(song) {
    this.likedSongs = this.likedSongs.filter(s => s.title !== song.title);
    this.save();
  }

  isSongLiked(song) {
    return this.likedSongs.some(s => s.title === song.title);
  }

  createPlaylist(name) {
    const playlist = {
      id: Date.now(),
      name: name,
      songs: [],
      createdAt: new Date().toISOString()
    };
    this.playlists.push(playlist);
    this.save();
    return playlist;
  }

  addToPlaylist(playlistId, song) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.songs.find(s => s.title === song.title)) {
      playlist.songs.push(song);
      this.save();
    }
  }

  deletePlaylist(playlistId) {
    this.playlists = this.playlists.filter(p => p.id !== playlistId);
    this.save();
  }
}