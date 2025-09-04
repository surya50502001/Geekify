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

            var uploads = await LoadUploads();
            uploads.Add(new UploadedSong
            {
                Filename = fileName,
                Name = song.FileName,
                Uploader = uploader,
                UploadDate = DateTime.Now
            });
            await SaveUploads(uploads);
            
            Console.WriteLine($"Upload record saved. Total uploads: {uploads.Count}");

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
                uploads = uploads.Where(u => u.Filename != filename).ToList();
                await SaveUploads(uploads);
                
                return Ok(new { success = true });
            }
            return NotFound(new { success = false });
        }

        private async Task<List<UploadedSong>> LoadUploads()
        {
            if (!System.IO.File.Exists(_uploadsFile))
                return new List<UploadedSong>();

            var json = await System.IO.File.ReadAllTextAsync(_uploadsFile);
            return JsonSerializer.Deserialize<List<UploadedSong>>(json) ?? new List<UploadedSong>();
        }

        private async Task SaveUploads(List<UploadedSong> uploads)
        {
            var json = JsonSerializer.Serialize(uploads, new JsonSerializerOptions { WriteIndented = true });
            await System.IO.File.WriteAllTextAsync(_uploadsFile, json);
        }
    }

    public class UploadedSong
    {
        public string Filename { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Uploader { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; }
    }
}