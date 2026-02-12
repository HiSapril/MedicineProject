using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotificationService.Models;

/// <summary>
/// DELIVERY DOMAIN: Notification Entity
/// 
/// CRITICAL DOMAIN RULES:
/// 1. Notifications are SYSTEM-GENERATED delivery records
/// 2. Notifications are NOT editable business objects
/// 3. Message content is IMMUTABLE after creation
/// 4. Only state transitions are allowed (Read, Acknowledged, Retry)
/// 5. Notifications are an AUDIT TRAIL of delivery attempts
/// 
/// REMINDER ≠ NOTIFICATION:
/// - Reminder defines WHEN to notify (trigger logic)
/// - Notification records THAT we notified (delivery record)
/// </summary>
public class Notification
{
    [Key]
    public Guid Id { get; set; }
    
    /// <summary>
    /// User who should receive this notification
    /// </summary>
    [Required]
    public Guid UserId { get; set; }
    
    /// <summary>
    /// Source reminder that triggered this notification
    /// IMMUTABLE: Cannot be changed after creation
    /// </summary>
    [Required]
    public Guid SourceReminderId { get; set; }
    
    /// <summary>
    /// Type of source event (Medication, Appointment, Health)
    /// </summary>
    [Required]
    public SourceEventType SourceEventType { get; set; }
    
    /// <summary>
    /// ID of the source event (appointment ID, medication ID, etc.)
    /// </summary>
    [Required]
    public Guid SourceEventId { get; set; }
    
    /// <summary>
    /// Notification title
    /// IMMUTABLE: Cannot be edited after creation
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Notification message content
    /// IMMUTABLE: Cannot be edited after creation
    /// </summary>
    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;
    
    /// <summary>
    /// Current delivery status
    /// Mutable: Can transition through defined state machine
    /// </summary>
    [Required]
    public NotificationStatus Status { get; set; }
    
    /// <summary>
    /// Delivery channel used for this notification
    /// IMMUTABLE: Cannot be changed after creation
    /// </summary>
    [Required]
    public DeliveryChannel DeliveryChannel { get; set; }
    
    /// <summary>
    /// Type of recipient (Elderly User or Caregiver)
    /// </summary>
    [Required]
    public RecipientType RecipientType { get; set; }
    
    /// <summary>
    /// When the notification was sent
    /// IMMUTABLE: Set once at creation
    /// </summary>
    [Required]
    public DateTime SentAt { get; set; }
    
    /// <summary>
    /// When the notification was successfully delivered
    /// Set when status transitions to Delivered
    /// </summary>
    public DateTime? DeliveredAt { get; set; }
    
    /// <summary>
    /// When the notification was read by recipient
    /// Set when status transitions to Read
    /// </summary>
    public DateTime? ReadAt { get; set; }
    
    /// <summary>
    /// When the notification was acknowledged by recipient
    /// Set when status transitions to Acknowledged (terminal state)
    /// </summary>
    public DateTime? AcknowledgedAt { get; set; }
    
    /// <summary>
    /// Reason for delivery failure (if status = Failed)
    /// Examples: "Device offline", "Invalid email", "Push token expired"
    /// </summary>
    [MaxLength(500)]
    public string? FailureReason { get; set; }
    
    /// <summary>
    /// Number of retry attempts made
    /// Incremented each time retry is initiated
    /// </summary>
    public int RetryCount { get; set; } = 0;
    
    /// <summary>
    /// Audit timestamp: when record was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Audit timestamp: when record was last updated
    /// </summary>
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// Navigation property: History of all delivery attempts
    /// </summary>
    public ICollection<DeliveryAttempt> DeliveryAttempts { get; set; } = new List<DeliveryAttempt>();
}
