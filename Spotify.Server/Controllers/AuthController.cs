using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spotify.Server.Data;
using Spotify.Server.Models;
using System.Text.Json;

namespace Spotify.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        
        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            Console.WriteLine($"Login request received for user: {request.UserId}");
            
            var users = await LoadUsers();
            Console.WriteLine($"Loaded {users.Count} users from file");
            
            var user = users.FirstOrDefault(u => u.Id == request.UserId && u.Password == request.Password);
            
            if (user != null)
            {
                Console.WriteLine($"Login successful for user: {user.Id}, isAdmin: {user.IsAdmin}");
                return Ok(new { success = true, user = new { id = user.Id, isAdmin = user.IsAdmin } });
            }
            
            Console.WriteLine($"Login failed for user: {request.UserId}");
            return Ok(new { success = false });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Id == request.UserId))
            {
                return Ok(new { success = false, message = "User already exists" });
            }

            var newUser = new User 
            { 
                Id = request.UserId, 
                Password = request.Password, 
                IsAdmin = false 
            };
            
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        private async Task<List<User>> LoadUsers()
        {
            var users = await _context.Users.ToListAsync();
            if (!users.Any())
            {
                var defaultUser = new User { Id = "admin", Password = "admin123", IsAdmin = true };
                _context.Users.Add(defaultUser);
                await _context.SaveChangesAsync();
                users.Add(defaultUser);
            }
            return users;
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