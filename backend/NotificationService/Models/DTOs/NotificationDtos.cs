using System.ComponentModel.DataAnnotations;

namespace NotificationService.Models.DTOs;

/// <summary>
/// DTO for creating a new notification
/// 
/// CRITICAL: This is ONLY used by the system (Reminder Service)
/// NOT exposed to external API for manual creation
/// </summary>
public class CreateNotificationDto
{
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    public Guid SourceReminderId { get; set; }
    
    [Required]
    public SourceEventType SourceEventType { get; set; }
    
    [Required]
    public Guid SourceEventId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;
    
    [Required]
    public DeliveryChannel DeliveryChannel { get; set; }
    
    [Required]
    public RecipientType RecipientType { get; set; }
}

/// <summary>
/// DTO for notification detail response
/// Includes full delivery history
/// </summary>
public class NotificationDetailDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid SourceReminderId { get; set; }
    public SourceEventType SourceEventType { get; set; }
    public Guid SourceEventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationStatus Status { get; set; }
    public DeliveryChannel DeliveryChannel { get; set; }
    public RecipientType RecipientType { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public string? FailureReason { get; set; }
    public int RetryCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// Full delivery attempt history for audit trail
    /// </summary>
    public List<DeliveryAttemptDto> DeliveryAttempts { get; set; } = new();

    public static NotificationDetailDto FromEntity(Notification notification)
    {
        return new NotificationDetailDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            SourceReminderId = notification.SourceReminderId,
            SourceEventType = notification.SourceEventType,
            SourceEventId = notification.SourceEventId,
            Title = notification.Title,
            Message = notification.Message,
            Status = notification.Status,
            DeliveryChannel = notification.DeliveryChannel,
            RecipientType = notification.RecipientType,
            SentAt = DateTime.SpecifyKind(notification.SentAt, DateTimeKind.Utc),
            DeliveredAt = notification.DeliveredAt.HasValue ? DateTime.SpecifyKind(notification.DeliveredAt.Value, DateTimeKind.Utc) : null,
            ReadAt = notification.ReadAt.HasValue ? DateTime.SpecifyKind(notification.ReadAt.Value, DateTimeKind.Utc) : null,
            AcknowledgedAt = notification.AcknowledgedAt.HasValue ? DateTime.SpecifyKind(notification.AcknowledgedAt.Value, DateTimeKind.Utc) : null,
            FailureReason = notification.FailureReason,
            RetryCount = notification.RetryCount,
            CreatedAt = DateTime.SpecifyKind(notification.CreatedAt, DateTimeKind.Utc),
            UpdatedAt = DateTime.SpecifyKind(notification.UpdatedAt, DateTimeKind.Utc),
            DeliveryAttempts = notification.DeliveryAttempts.Select(da => new DeliveryAttemptDto
            {
                AttemptNumber = da.AttemptNumber,
                AttemptedAt = DateTime.SpecifyKind(da.AttemptedAt, DateTimeKind.Utc),
                Status = da.Status,
                Channel = da.Channel,
                ErrorReason = da.ErrorReason
            }).ToList()
        };
    }
}

/// <summary>
/// DTO for delivery attempt record
/// </summary>
public class DeliveryAttemptDto
{
    public int AttemptNumber { get; set; }
    public DateTime AttemptedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public DeliveryChannel Channel { get; set; }
    public string? ErrorReason { get; set; }
}

/// <summary>
/// DTO for notification list response (summary view)
/// </summary>
public class NotificationSummaryDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid SourceReminderId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationStatus Status { get; set; }
    public DeliveryChannel DeliveryChannel { get; set; }
    public RecipientType RecipientType { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public string? FailureReason { get; set; }
    public int RetryCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public static NotificationSummaryDto FromEntity(Notification notification)
    {
        return new NotificationSummaryDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            SourceReminderId = notification.SourceReminderId,
            Title = notification.Title,
            Message = notification.Message,
            Status = notification.Status,
            DeliveryChannel = notification.DeliveryChannel,
            RecipientType = notification.RecipientType,
            SentAt = DateTime.SpecifyKind(notification.SentAt, DateTimeKind.Utc),
            DeliveredAt = notification.DeliveredAt.HasValue ? DateTime.SpecifyKind(notification.DeliveredAt.Value, DateTimeKind.Utc) : null,
            ReadAt = notification.ReadAt.HasValue ? DateTime.SpecifyKind(notification.ReadAt.Value, DateTimeKind.Utc) : null,
            AcknowledgedAt = notification.AcknowledgedAt.HasValue ? DateTime.SpecifyKind(notification.AcknowledgedAt.Value, DateTimeKind.Utc) : null,
            FailureReason = notification.FailureReason,
            RetryCount = notification.RetryCount,
            CreatedAt = DateTime.SpecifyKind(notification.CreatedAt, DateTimeKind.Utc),
            UpdatedAt = DateTime.SpecifyKind(notification.UpdatedAt, DateTimeKind.Utc)
        };
    }
}
