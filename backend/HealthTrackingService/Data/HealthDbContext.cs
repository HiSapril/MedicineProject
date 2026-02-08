using Microsoft.EntityFrameworkCore;
using HealthTrackingService.Models;

namespace HealthTrackingService.Data
{
    public class HealthDbContext : DbContext
    {
        public HealthDbContext(DbContextOptions<HealthDbContext> options) : base(options)
        {
        }

        public DbSet<HealthLog> HealthLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<HealthLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Date).IsRequired();
            });
        }
    }
}
