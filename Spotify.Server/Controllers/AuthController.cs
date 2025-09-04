using Microsoft.AspNetCore.Mvc;
using Spotify.Server.Models;
using System.Text.Json;

namespace Spotify.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly string _usersFile = Path.Combine(Directory.GetCurrentDirectory(), "users.json");

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var users = await LoadUsers();
            var user = users.FirstOrDefault(u => u.Id == request.UserId && u.Password == request.Password);
            
            if (user != null)
            {
                return Ok(new { success = true, user = new { id = user.Id, isAdmin = user.IsAdmin } });
            }
            
            return Ok(new { success = false });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var users = await LoadUsers();
            
            if (users.Any(u => u.Id == request.UserId))
            {
                return Ok(new { success = false, message = "User already exists" });
            }

            users.Add(new User 
            { 
                Id = request.UserId, 
                Password = request.Password, 
                IsAdmin = false 
            });
            
            await SaveUsers(users);
            return Ok(new { success = true });
        }

        private async Task<List<User>> LoadUsers()
        {
            if (!System.IO.File.Exists(_usersFile))
            {
                var defaultUsers = new List<User>
                {
                    new User { Id = "admin", Password = "admin123", IsAdmin = true }
                };
                await SaveUsers(defaultUsers);
                return defaultUsers;
            }

            var json = await System.IO.File.ReadAllTextAsync(_usersFile);
            return JsonSerializer.Deserialize<List<User>>(json) ?? new List<User>();
        }

        private async Task SaveUsers(List<User> users)
        {
            var json = JsonSerializer.Serialize(users, new JsonSerializerOptions { WriteIndented = true });
            await System.IO.File.WriteAllTextAsync(_usersFile, json);
        }
    }

    public class LoginRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}