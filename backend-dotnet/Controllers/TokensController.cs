using System.Security.Claims;
using KinekatyApi.Data;
using KinekatyApi.DTOs;
using KinekatyApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KinekatyApi.Controllers;

[ApiController]
[Route("api/tokens")]
[Authorize]
public class TokensController(AppDbContext db) : ControllerBase
{
    // POST /api/tokens/buy
    [HttpPost("buy")]
    public async Task<IActionResult> BuyTokens([FromBody] BuyTokensRequest req)
    {
        if (req.Amount <= 0) return BadRequest(new { error = "Amount must be greater than 0" });
        var userId = GetUserId();
        var tx = new TokenTransaction { UserId = userId, Amount = req.Amount, Type = "purchase" };
        db.TokenTransactions.Add(tx);
        await db.SaveChangesAsync();
        var balance = await GetBalance(userId);
        return Ok(new { message = "Tokens purchased", balance, transaction = ToDto(tx) });
    }

    // POST /api/tokens/use
    [HttpPost("use")]
    public async Task<IActionResult> UseTokens([FromBody] UseTokensRequest req)
    {
        if (req.Amount <= 0) return BadRequest(new { error = "Amount must be greater than 0" });
        var userId  = GetUserId();
        var balance = await GetBalance(userId);
        if (balance < req.Amount) return BadRequest(new { error = "Insufficient tokens" });
        var tx = new TokenTransaction { UserId = userId, Amount = -req.Amount, Type = "use" };
        db.TokenTransactions.Add(tx);
        await db.SaveChangesAsync();
        return Ok(new { message = "Tokens used", balance = balance - req.Amount, transaction = ToDto(tx) });
    }

    // GET /api/tokens/me
    [HttpGet("me")]
    public async Task<IActionResult> GetMyTokens()
    {
        var userId  = GetUserId();
        var balance = await GetBalance(userId);
        var history = await db.TokenTransactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => ToDto(t))
            .ToListAsync();
        return Ok(new { userId, balance, history });
    }

    // GET /api/tokens/all
    [HttpGet("all")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllTokens()
    {
        var transactions = await db.TokenTransactions
            .Include(t => t.User)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => ToDto(t))
            .ToListAsync();
        return Ok(transactions);
    }

    private async Task<int> GetBalance(int userId) =>
        await db.TokenTransactions
            .Where(t => t.UserId == userId)
            .SumAsync(t => (int?)t.Amount) ?? 0;

    private int GetUserId() =>
        int.Parse(User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("User ID not found in token"));

    private static TokenTransactionDto ToDto(TokenTransaction t) =>
        new(t.Id, t.UserId, t.Amount, t.Type, t.CreatedAt);
}
