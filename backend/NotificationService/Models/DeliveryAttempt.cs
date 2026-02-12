using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotificationService.Models;

/// <summary>
/// DELIVERY DOMAIN: Delivery Attempt Record
/// 
/// Represents a single attempt to deliver a notification.
/// Multiple attempts may exist for a single notification (in case of retries).
/// 
/// This is part of the AUDIT TRAIL and is IMMUTABLE once created.
/// </summary>
public class DeliveryAttempt
{
    [Key]
    public Guid Id { get; set; }
    
    /// <summary>
    /// Foreign key to parent Notification
    /// </summary>
    [Required]
    public Guid NotificationId { get; set; }
    
    /// <summary>
    /// Navigation property to parent Notification
    /// </summary>
    [ForeignKey(nameof(NotificationId))]
    public Notification Notification { get; set; } = null!;
    
    /// <summary>
    /// Sequential attempt number (1, 2, 3, ...)
    /// First attempt is 1, retries increment this
    /// </summary>
    [Required]
    public int AttemptNumber { get; set; }
    
    /// <summary>
    /// When this delivery attempt was made
    /// </summary>
    [Required]
    public DateTime AttemptedAt { get; set; }
    
    /// <summary>
    /// Result of this delivery attempt
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty; // "Success" or "Failed"
    
    /// <summary>
    /// Delivery channel used for this attempt
    /// </summary>
    [Required]
    public DeliveryChannel Channel { get; set; }
    
    /// <summary>
    /// Error reason if delivery failed
    /// Examples: "Device offline", "Network timeout", "Invalid recipient"
    /// </summary>
    [MaxLength(500)]
    public string? ErrorReason { get; set; }
    
    /// <summary>
    /// Audit timestamp: when this record was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }
}
