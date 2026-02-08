using Microsoft.EntityFrameworkCore;
using MedicationService.Models;

namespace MedicationService.Data
{
    public class MedicationDbContext : DbContext
    {
        public MedicationDbContext(DbContextOptions<MedicationDbContext> options) : base(options)
        {
        }

        public DbSet<Medication> Medications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Medication>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.MedicationName).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
            });
        }
    }
}
