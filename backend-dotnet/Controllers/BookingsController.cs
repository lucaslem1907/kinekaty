using System.Security.Claims;
using KinekatyApi.Data;
using KinekatyApi.DTOs;
using KinekatyApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KinekatyApi.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController(AppDbContext db) : ControllerBase
{
    // POST /api/bookings
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest req)
    {
        var userId = GetUserId();

        var cls = await db.Classes.FindAsync(req.ClassId);
        if (cls is null) return NotFound(new { error = "Class not found" });

        var currentCount = await db.Bookings.CountAsync(b => b.ClassId == req.ClassId);
        if (currentCount >= cls.Capacity)
            return BadRequest(new { error = "Class is full" });

        if (await db.Bookings.AnyAsync(b => b.UserId == userId && b.ClassId == req.ClassId))
            return Conflict(new { error = "Already booked this class" });

        var booking = new Booking { UserId = userId, ClassId = req.ClassId };
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();

        await db.Entry(booking).Reference(b => b.User).LoadAsync();
        await db.Entry(booking).Reference(b => b.Class).LoadAsync();
        return Created($"/api/bookings/{booking.Id}", ToDto(booking));
    }

    // GET /api/bookings/me
    [HttpGet("me")]
    public async Task<IActionResult> GetMyBookings()
    {
        var userId = GetUserId();
        var bookings = await db.Bookings
            .Where(b => b.UserId == userId)
            .Include(b => b.User)
            .Include(b => b.Class)
            .OrderByDescending(b => b.BookedAt)
            .Select(b => ToDto(b))
            .ToListAsync();
        return Ok(bookings);
    }

    // GET /api/bookings/all
    [HttpGet("all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllBookings()
    {
        var bookings = await db.Bookings
            .Include(b => b.User)
            .Include(b => b.Class)
            .OrderByDescending(b => b.BookedAt)
            .Select(b => ToDto(b))
            .ToListAsync();
        return Ok(bookings);
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("User ID not found in token"));

    private static BookingDto ToDto(Booking b) =>
        new(b.Id, b.UserId, b.User.Name, b.ClassId, b.Class.Title, b.BookedAt);
}
