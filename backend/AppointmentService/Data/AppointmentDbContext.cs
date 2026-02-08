using Microsoft.EntityFrameworkCore;
using AppointmentService.Models;

namespace AppointmentService.Data
{
    public class AppointmentDbContext : DbContext
    {
        public AppointmentDbContext(DbContextOptions<AppointmentDbContext> options) : base(options)
        {
        }

        public DbSet<Appointment> Appointments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DoctorName).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Location).IsRequired();
            });
        }
    }
}
