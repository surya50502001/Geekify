namespace Spotify.Server.Models
{
    public class GlobalPlaylist
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }
}