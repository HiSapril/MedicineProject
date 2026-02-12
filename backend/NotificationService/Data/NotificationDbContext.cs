using Microsoft.EntityFrameworkCore;
using NotificationService.Models;

namespace NotificationService.Data;

/// <summary>
/// Database context for Notification Service
/// 
/// DELIVERY DOMAIN: Manages notification delivery records and audit trail
/// </summary>
public class NotificationDbContext : DbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<DeliveryAttempt> DeliveryAttempts { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Notification entity configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");
            
            entity.HasKey(n => n.Id);
            
            entity.Property(n => n.Title)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(n => n.Message)
                .IsRequired()
                .HasMaxLength(1000);
            
            entity.Property(n => n.Status)
                .IsRequired()
                .HasConversion<int>();
            
            entity.Property(n => n.DeliveryChannel)
                .IsRequired()
                .HasConversion<int>();
            
            entity.Property(n => n.RecipientType)
                .IsRequired()
                .HasConversion<int>();
            
            entity.Property(n => n.SourceEventType)
                .IsRequired()
                .HasConversion<int>();
            
            entity.Property(n => n.FailureReason)
                .HasMaxLength(500);
            
            entity.Property(n => n.SentAt)
                .IsRequired();
            
            entity.Property(n => n.CreatedAt)
                .IsRequired();
            
            entity.Property(n => n.UpdatedAt)
                .IsRequired();
            
            // Index for querying by user
            entity.HasIndex(n => n.UserId);
            
            // Index for querying by status
            entity.HasIndex(n => n.Status);
            
            // Index for sorting by sent date
            entity.HasIndex(n => n.SentAt);
            
            // Relationship with DeliveryAttempts
            entity.HasMany(n => n.DeliveryAttempts)
                .WithOne(da => da.Notification)
                .HasForeignKey(da => da.NotificationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        // DeliveryAttempt entity configuration
        modelBuilder.Entity<DeliveryAttempt>(entity =>
        {
            entity.ToTable("DeliveryAttempts");
            
            entity.HasKey(da => da.Id);
            
            entity.Property(da => da.Status)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(da => da.Channel)
                .IsRequired()
                .HasConversion<int>();
            
            entity.Property(da => da.ErrorReason)
                .HasMaxLength(500);
            
            entity.Property(da => da.AttemptedAt)
                .IsRequired();
            
            entity.Property(da => da.CreatedAt)
                .IsRequired();
            
            // Index for querying by notification
            entity.HasIndex(da => da.NotificationId);
        });
    }
}
