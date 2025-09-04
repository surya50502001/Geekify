using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Spotify.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SongController : ControllerBase
    {
        private readonly string _songsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "songs");
        private readonly string _uploadsFile = Path.Combine(Directory.GetCurrentDirectory(), "uploads.json");

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile song, string uploader)
        {
            if (song == null || song.Length == 0)
                return BadRequest(new { success = false, error = "No file uploaded" });

            var fileName = $"{DateTime.Now.Ticks}-{song.FileName}";
            var filePath = Path.Combine(_songsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await song.CopyToAsync(stream);
            }

            var uploads = await LoadUploads();
            uploads.Add(new
            {
                filename = fileName,
                name = song.FileName,
                uploader = uploader,
                uploadDate = DateTime.Now
            });
            await SaveUploads(uploads);

            return Ok(new { success = true, filename = fileName, originalName = song.FileName });
        }

        [HttpGet("songs")]
        public async Task<IActionResult> GetSongs()
        {
            var uploads = await LoadUploads();
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
                
                var uploads = await LoadUploads();
                uploads = uploads.Where(u => u.GetProperty("filename").GetString() != filename).ToList();
                await SaveUploads(uploads);
                
                return Ok(new { success = true });
            }
            return NotFound(new { success = false });
        }

        private async Task<List<JsonElement>> LoadUploads()
        {
            if (!System.IO.File.Exists(_uploadsFile))
                return new List<JsonElement>();

            var json = await System.IO.File.ReadAllTextAsync(_uploadsFile);
            return JsonSerializer.Deserialize<List<JsonElement>>(json) ?? new List<JsonElement>();
        }

        private async Task SaveUploads(object uploads)
        {
            var json = JsonSerializer.Serialize(uploads, new JsonSerializerOptions { WriteIndented = true });
            await System.IO.File.WriteAllTextAsync(_uploadsFile, json);
        }
    }
}