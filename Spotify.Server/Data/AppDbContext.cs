using Microsoft.EntityFrameworkCore;
using Spotify.Server.Models;

namespace Spotify.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<UserData> UserDatas { get; set; }
        public DbSet<GlobalPlaylist> GlobalPlaylists { get; set; }
        public DbSet<UploadedSong> UploadedSongs { get; set; }
    }
}