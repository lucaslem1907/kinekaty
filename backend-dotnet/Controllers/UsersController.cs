using KinekatyApi.Data;
using KinekatyApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KinekatyApi.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Policy = "AdminOnly")]
public class UsersController(AppDbContext db) : ControllerBase
{
    // PUT /api/users/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest req)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound(new { error = "User not found" });
        if (user.IsAdmin)  return Forbid();

        if (req.Name   is not null) user.Name   = req.Name;
        if (req.Email  is not null)
        {
            if (await db.Users.AnyAsync(u => u.Email == req.Email && u.Id != id))
                return Conflict(new { error = "Email already in use" });
            user.Email = req.Email;
        }
        if (req.Phone  is not null) user.Phone  = req.Phone;
        if (req.Street is not null) user.Street = req.Street;
        if (req.Number.HasValue)    user.Number = req.Number;
        if (req.City   is not null) user.City   = req.City;

        await db.SaveChangesAsync();

        return Ok(new
        {
            id        = user.Id,
            name      = user.Name,
            email     = user.Email,
            phone     = user.Phone,
            street    = user.Street,
            number    = user.Number,
            city      = user.City,
            isAdmin   = user.IsAdmin,
            createdAt = user.CreatedAt
        });
    }

    // DELETE /api/users/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound(new { error = "User not found" });
        if (user.IsAdmin) return Forbid();

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return Ok(new { message = "User deleted" });
    }
}
