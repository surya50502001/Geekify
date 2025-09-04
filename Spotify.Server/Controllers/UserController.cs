using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spotify.Server.Data;
using Spotify.Server.Models;
using System.Text.Json;

namespace Spotify.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        
        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("save-user-data")]
        public async Task<IActionResult> SaveUserData([FromBody] SaveUserDataRequest request)
        {
            try
            {
                var userData = await _context.UserDatas.FirstOrDefaultAsync(u => u.UserId == request.UserId);
                
                if (userData == null)
                {
                    userData = new UserData { UserId = request.UserId };
                    _context.UserDatas.Add(userData);
                }
                
                userData.LikedSongs = JsonSerializer.Serialize(request.Data.LikedSongs);
                userData.Playlists = JsonSerializer.Serialize(request.Data.Playlists);
                
                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpGet("load-user-data/{userId}")]
        public async Task<IActionResult> LoadUserData(string userId)
        {
            try
            {
                var userData = await _context.UserDatas.FirstOrDefaultAsync(u => u.UserId == userId);
                
                if (userData == null)
                {
                    return Ok(new { success = true, data = new { LikedSongs = new List<object>(), Playlists = new List<object>() } });
                }
                
                var result = new
                {
                    LikedSongs = string.IsNullOrEmpty(userData.LikedSongs) ? new List<object>() : JsonSerializer.Deserialize<List<object>>(userData.LikedSongs),
                    Playlists = string.IsNullOrEmpty(userData.Playlists) ? new List<object>() : JsonSerializer.Deserialize<List<object>>(userData.Playlists)
                };
                
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("save-global-playlist")]
        public async Task<IActionResult> SaveGlobalPlaylist([FromBody] SaveGlobalPlaylistRequest request)
        {
            try
            {
                _context.GlobalPlaylists.Add(request.Playlist);
                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpGet("global-playlists")]
        public async Task<IActionResult> GetGlobalPlaylists()
        {
            try
            {
                var playlists = await _context.GlobalPlaylists.ToListAsync();
                return Ok(new { success = true, playlists });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
    }

    public class SaveUserDataRequest
    {
        public string UserId { get; set; } = string.Empty;
        public UserDataDto Data { get; set; } = new();
    }
    
    public class UserDataDto
    {
        public List<object> LikedSongs { get; set; } = new();
        public List<object> Playlists { get; set; } = new();
    }

    public class SaveGlobalPlaylistRequest
    {
        public GlobalPlaylist Playlist { get; set; } = new();
    }
}