using Microsoft.AspNetCore.Mvc;
using Spotify.Server.Models;
using System.Text.Json;

namespace Spotify.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly string _dataFile = Path.Combine(Directory.GetCurrentDirectory(), "user-data.json");

        [HttpPost("save-user-data")]
        public async Task<IActionResult> SaveUserData([FromBody] SaveUserDataRequest request)
        {
            try
            {
                var allData = new Dictionary<string, UserData>();
                
                if (System.IO.File.Exists(_dataFile))
                {
                    var json = await System.IO.File.ReadAllTextAsync(_dataFile);
                    var wrapper = JsonSerializer.Deserialize<UserDataWrapper>(json);
                    allData = wrapper?.Users ?? new Dictionary<string, UserData>();
                }

                allData[request.UserId] = request.Data;

                var wrapperData = new UserDataWrapper { Users = allData };
                var jsonString = JsonSerializer.Serialize(wrapperData, new JsonSerializerOptions { WriteIndented = true });
                await System.IO.File.WriteAllTextAsync(_dataFile, jsonString);

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
                if (!System.IO.File.Exists(_dataFile))
                {
                    return Ok(new { success = true, data = new UserData() });
                }

                var json = await System.IO.File.ReadAllTextAsync(_dataFile);
                var wrapper = JsonSerializer.Deserialize<UserDataWrapper>(json);
                var userData = wrapper?.Users?.GetValueOrDefault(userId) ?? new UserData();

                return Ok(new { success = true, data = userData });
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
        public UserData Data { get; set; } = new();
    }

    public class UserDataWrapper
    {
        public Dictionary<string, UserData> Users { get; set; } = new();
    }
}