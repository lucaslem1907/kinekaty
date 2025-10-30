using KinekatyApi.Models;
using Microsoft.EntityFrameworkCore;

namespace KinekatyApi.Data;

public static class Seeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (!await db.Users.AnyAsync(u => u.Email == "admin@studio.local"))
            db.Users.Add(new User
            {
                Name     = "Admin",
                Email    = "admin@studio.local",
                Password = BCrypt.Net.BCrypt.HashPassword("adminpass"),
                Phone    = "000",
                IsAdmin  = true
            });

        if (!await db.Users.AnyAsync(u => u.Email == "client@example.com"))
            db.Users.Add(new User
            {
                Name     = "Client",
                Email    = "client@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("userpass"),
                Phone    = "111",
                IsAdmin  = false
            });

        await db.SaveChangesAsync();

        var tomorrow = DateTime.UtcNow.AddDays(1).Date;

        if (!await db.Classes.AnyAsync(c => c.Title == "Morning Yoga"))
            db.Classes.Add(new Class
            {
                Title       = "Morning Yoga",
                Description = "Gentle stretch & breath",
                Date        = tomorrow,
                Time        = "09:00",
                Duration    = 60,
                Location    = "Studio A",
                Capacity    = 10
            });

        if (!await db.Classes.AnyAsync(c => c.Title == "Evening Pilates"))
            db.Classes.Add(new Class
            {
                Title       = "Evening Pilates",
                Description = "Core & mobility",
                Date        = tomorrow,
                Time        = "18:30",
                Duration    = 50,
                Location    = "Studio B",
                Capacity    = 8
            });

        await db.SaveChangesAsync();
    }
}
