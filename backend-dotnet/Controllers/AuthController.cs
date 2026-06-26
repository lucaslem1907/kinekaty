using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KinekatyApi.Data;
using KinekatyApi.DTOs;
using KinekatyApi.Models;
using KinekatyApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace KinekatyApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IConfiguration config, IEmailService emailService) : ControllerBase
{
    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { error = "Email already registered" });

        var user = new User
        {
            Name     = req.Name,
            Email    = req.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Phone    = req.Phone,
            IsAdmin  = req.IsAdmin,
            Street   = req.Address,
            Number   = int.TryParse(req.HouseNumber, out var n) ? n : null,
            City     = req.City
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        _ = emailService.SendWelcomeEmailAsync(user.Email, user.Name);

        return Created($"/api/auth/{user.Id}", new
        {
            id      = user.Id,
            name    = user.Name,
            email   = user.Email,
            isAdmin = user.IsAdmin
        });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user is null)
            return BadRequest(new { error = "Invalid credentials" });

        if (user.IsAdmin != req.IsAdmin)
            return BadRequest(new { error = "Invalid role" });

        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.Password))
            return BadRequest(new { error = "Invalid credentials" });

        var token = GenerateToken(user);
        return Ok(new AuthResponse(token, ToDto(user)));
    }

    // GET /api/auth  — admin only, returns non-admin users
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await db.Users
            .Where(u => !u.IsAdmin)
            .Select(u => ToDto(u))
            .ToListAsync();
        return Ok(users);
    }

    private string GenerateToken(User user)
    {
        var jwtKey    = config["Jwt:Key"]      ?? throw new InvalidOperationException("Jwt:Key not configured");
        var issuer    = config["Jwt:Issuer"]   ?? "KinekatyApi";
        var audience  = config["Jwt:Audience"] ?? "KinekatyApi";

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("sub",     user.Id.ToString()),
            new Claim("email",   user.Email),
            new Claim("isAdmin", user.IsAdmin.ToString().ToLower()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.Name, u.Email, u.Phone, u.Street, u.Number, u.City, u.IsAdmin, u.CreatedAt);
}
