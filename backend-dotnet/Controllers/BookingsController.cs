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

        // Check token balance
        var balance = await db.TokenTransactions
            .Where(t => t.UserId == userId)
            .SumAsync(t => (int?)t.Amount) ?? 0;

        if (balance < cls.TokenCost)
            return BadRequest(new { error = $"Insufficient tokens. This class costs {cls.TokenCost} token(s), you have {balance}." });

        // Deduct tokens and create booking atomically
        var tx = new TokenTransaction { UserId = userId, Amount = -cls.TokenCost, Type = "use" };
        db.TokenTransactions.Add(tx);

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

    // DELETE /api/bookings/{id}
    // Admin: can always cancel, tokens refunded to the client.
    // Client: can only cancel their own booking if the class is > 48 h away.
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var callerId = GetUserId();
        var isAdmin  = User.HasClaim("isAdmin", "true");

        var booking = await db.Bookings
            .Include(b => b.Class)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null) return NotFound(new { error = "Booking not found" });

        if (!isAdmin && booking.UserId != callerId)
            return Forbid();

        if (!isAdmin)
        {
            var hoursUntilClass = (booking.Class.Date - DateTime.UtcNow).TotalHours;
            if (hoursUntilClass < 48)
                return BadRequest(new { error = "Cancellations must be made at least 48 hours before the class." });
        }

        // Refund tokens to the client
        var refund = new TokenTransaction
        {
            UserId = booking.UserId,
            Amount = booking.Class.TokenCost,
            Type   = "refund"
        };
        db.TokenTransactions.Add(refund);
        db.Bookings.Remove(booking);
        await db.SaveChangesAsync();

        return Ok(new { message = "Booking cancelled and tokens refunded." });
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("User ID not found in token"));

    private static BookingDto ToDto(Booking b) =>
        new(b.Id, b.UserId, b.User.Name, b.ClassId, b.Class.Title, b.BookedAt);
}
