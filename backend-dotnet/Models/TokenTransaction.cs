namespace KinekatyApi.Models;

public class TokenTransaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int Amount { get; set; }   // positive = bought, negative = used
    public string Type { get; set; } = string.Empty;  // "purchase" or "use"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
