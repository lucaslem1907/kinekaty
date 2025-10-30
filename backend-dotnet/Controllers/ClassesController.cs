using KinekatyApi.Data;
using KinekatyApi.DTOs;
using KinekatyApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KinekatyApi.Controllers;

[ApiController]
[Route("api/classes")]
public class ClassesController(AppDbContext db) : ControllerBase
{
    // GET /api/classes
    [HttpGet]
    public async Task<IActionResult> GetClasses()
    {
        var classes = await db.Classes
            .Include(c => c.Bookings)
            .OrderBy(c => c.Date)
            .Select(c => ToDto(c))
            .ToListAsync();
        return Ok(classes);
    }

    // POST /api/classes
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassRequest req)
    {
        var cls = new Class
        {
            Title       = req.Title,
            Description = req.Description,
            Date        = req.Date,
            Time        = req.Time,
            Duration    = req.Duration,
            Location    = req.Location,
            Capacity    = req.Capacity
        };
        db.Classes.Add(cls);
        await db.SaveChangesAsync();
        await db.Entry(cls).Collection(c => c.Bookings).LoadAsync();
        return Created($"/api/classes/{cls.Id}", ToDto(cls));
    }

    // PUT /api/classes/{id}
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateClass(int id, [FromBody] UpdateClassRequest req)
    {
        var cls = await db.Classes.Include(c => c.Bookings).FirstOrDefaultAsync(c => c.Id == id);
        if (cls is null) return NotFound(new { error = "Class not found" });

        if (req.Title is not null)       cls.Title       = req.Title;
        if (req.Description is not null) cls.Description = req.Description;
        if (req.Date.HasValue)           cls.Date        = req.Date.Value;
        if (req.Time is not null)        cls.Time        = req.Time;
        if (req.Duration.HasValue)       cls.Duration    = req.Duration.Value;
        if (req.Location is not null)    cls.Location    = req.Location;
        if (req.Capacity.HasValue)       cls.Capacity    = req.Capacity.Value;

        await db.SaveChangesAsync();
        return Ok(ToDto(cls));
    }

    // DELETE /api/classes/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var cls = await db.Classes.FindAsync(id);
        if (cls is null) return NotFound(new { error = "Class not found" });
        db.Classes.Remove(cls);
        await db.SaveChangesAsync();
        return Ok(new { message = "Class deleted" });
    }

    private static ClassDto ToDto(Class c) => new(
        c.Id, c.Title, c.Description, c.Date, c.Time,
        c.Duration, c.Location, c.Capacity, c.Bookings.Count, c.CreatedAt);
}
