namespace Spotify.Server.Models
{
    public class UploadedSong
    {
        public int Id { get; set; }
        public string Filename { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Uploader { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; }
    }
}