using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spotify.Server.Data;
using Spotify.Server.Models;
using System.Text.Json;

namespace Spotify.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongController : ControllerBase
    {
        private readonly string _songsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "songs");
        private readonly AppDbContext _context;
        
        public SongController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile song, string uploader)
        {
            Console.WriteLine($"Upload request received from: {uploader}");
            
            if (song == null || song.Length == 0)
            {
                Console.WriteLine("No file uploaded");
                return BadRequest(new { success = false, error = "No file uploaded" });
            }

            Console.WriteLine($"Uploading file: {song.FileName}, Size: {song.Length} bytes");
            
            // Ensure directory exists
            if (!Directory.Exists(_songsPath))
            {
                Directory.CreateDirectory(_songsPath);
                Console.WriteLine($"Created directory: {_songsPath}");
            }

            var fileName = $"{DateTime.Now.Ticks}-{song.FileName}";
            var filePath = Path.Combine(_songsPath, fileName);
            
            Console.WriteLine($"Saving to: {filePath}");

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await song.CopyToAsync(stream);
            }
            
            Console.WriteLine($"File saved successfully: {fileName}");

            var uploadedSong = new UploadedSong
            {
                Filename = fileName,
                Name = song.FileName,
                Uploader = uploader,
                UploadDate = DateTime.Now
            };
            
            _context.UploadedSongs.Add(uploadedSong);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"Upload record saved successfully");

            return Ok(new { success = true, filename = fileName, originalName = song.FileName });
        }

        [HttpGet("songs")]
        public async Task<IActionResult> GetSongs()
        {
            var uploads = await _context.UploadedSongs.ToListAsync();
            return Ok(new { success = true, songs = uploads });
        }

        [HttpGet("play/{filename}")]
        public IActionResult PlaySong(string filename)
        {
            var filePath = Path.Combine(_songsPath, filename);
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            return File(stream, "audio/mpeg", enableRangeProcessing: true);
        }

        [HttpDelete("delete/{filename}")]
        public async Task<IActionResult> DeleteSong(string filename)
        {
            var filePath = Path.Combine(_songsPath, filename);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
                
                var uploadedSong = await _context.UploadedSongs.FirstOrDefaultAsync(u => u.Filename == filename);
                if (uploadedSong != null)
                {
                    _context.UploadedSongs.Remove(uploadedSong);
                    await _context.SaveChangesAsync();
                }
                
                return Ok(new { success = true });
            }
            return NotFound(new { success = false });
        }

    }
}