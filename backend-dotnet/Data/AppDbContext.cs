using Microsoft.EntityFrameworkCore;
using KinekatyApi.Models;

namespace KinekatyApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<TokenTransaction> TokenTransactions => Set<TokenTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.CreatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<Class>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.CreatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.HasKey(b => b.Id);
            e.HasIndex(b => new { b.UserId, b.ClassId }).IsUnique();
            e.HasOne(b => b.User)
             .WithMany(u => u.Bookings)
             .HasForeignKey(b => b.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(b => b.Class)
             .WithMany(c => c.Bookings)
             .HasForeignKey(b => b.ClassId)
             .OnDelete(DeleteBehavior.Cascade);
            e.Property(b => b.BookedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<TokenTransaction>(e =>
        {
            e.HasKey(t => t.Id);
            e.HasOne(t => t.User)
             .WithMany(u => u.Tokens)
             .HasForeignKey(t => t.UserId);
            e.Property(t => t.CreatedAt).HasDefaultValueSql("now()");
        });
    }
}
