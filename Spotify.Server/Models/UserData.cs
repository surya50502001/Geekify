namespace Spotify.Server.Models
{
    public class UserData
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string LikedSongs { get; set; } = string.Empty;
        public string Playlists { get; set; } = string.Empty;
    }
}