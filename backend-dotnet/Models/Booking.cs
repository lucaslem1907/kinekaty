namespace KinekatyApi.Models;

public class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public DateTime BookedAt { get; set; } = DateTime.UtcNow;
}
