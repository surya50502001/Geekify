namespace Spotify.Server.Models
{
    public class UserData
    {
        public string UserId { get; set; } = string.Empty;
        public List<Song> LikedSongs { get; set; } = new();
        public List<Playlist> Playlists { get; set; } = new();
    }

    public class Song
    {
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
    }

    public class Playlist
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<Song> Songs { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}