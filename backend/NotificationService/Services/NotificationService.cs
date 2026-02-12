using Microsoft.EntityFrameworkCore;
using NotificationService.Data;
using NotificationService.Models;
using NotificationService.Models.DTOs;

namespace NotificationService.Services;

/// <summary>
/// DELIVERY DOMAIN: Notification Service
/// 
/// RESPONSIBILITIES:
/// 1. Create notification delivery records (system-generated only)
/// 2. Track delivery lifecycle through state transitions
/// 3. Maintain delivery audit trail
/// 4. Allow LIMITED state updates (Read, Acknowledge, Retry)
/// 
/// PROHIBITED:
/// - Editing message content
/// - Deleting notifications
/// - Changing recipient
/// - Manual notification creation via API
/// </summary>
public interface INotificationService
{
    Task<NotificationSummaryDto> CreateNotificationAsync(CreateNotificationDto dto);
    Task<List<NotificationSummaryDto>> GetNotificationsByUserIdAsync(Guid userId, int page = 1, int pageSize = 50);
    Task<NotificationDetailDto?> GetNotificationDetailAsync(Guid id);
    Task<NotificationSummaryDto?> MarkAsReadAsync(Guid id);
    Task<NotificationSummaryDto?> AcknowledgeAsync(Guid id);
    Task<NotificationSummaryDto?> RetryDeliveryAsync(Guid id);
}

public class NotificationServiceImpl : INotificationService
{
    private readonly NotificationDbContext _context;
    private readonly ILogger<NotificationServiceImpl> _logger;
    
    public NotificationServiceImpl(
        NotificationDbContext context,
        ILogger<NotificationServiceImpl> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    /// <summary>
    /// Create a new notification delivery record
    /// SYSTEM-ONLY: Called by Reminder Service when reminder is triggered
    /// </summary>
    public async Task<NotificationSummaryDto> CreateNotificationAsync(CreateNotificationDto dto)
    {
        var now = DateTime.UtcNow;
        
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            SourceReminderId = dto.SourceReminderId,
            SourceEventType = dto.SourceEventType,
            SourceEventId = dto.SourceEventId,
            Title = dto.Title,
            Message = dto.Message,
            Status = NotificationStatus.Sent,
            DeliveryChannel = dto.DeliveryChannel,
            RecipientType = dto.RecipientType,
            SentAt = now,
            RetryCount = 0,
            CreatedAt = now,
            UpdatedAt = now
        };
        
        // Create initial delivery attempt record
        var deliveryAttempt = new DeliveryAttempt
        {
            Id = Guid.NewGuid(),
            NotificationId = notification.Id,
            AttemptNumber = 1,
            AttemptedAt = now,
            Status = "Pending", // Will be updated by delivery worker
            Channel = dto.DeliveryChannel,
            CreatedAt = now
        };
        
        _context.Notifications.Add(notification);
        _context.DeliveryAttempts.Add(deliveryAttempt);
        
        await _context.SaveChangesAsync();
        
        _logger.LogInformation(
            "Created notification {NotificationId} for user {UserId} via {Channel}",
            notification.Id, notification.UserId, notification.DeliveryChannel);
        
        return NotificationSummaryDto.FromEntity(notification);
    }
    
    /// <summary>
    /// Get notifications for a specific user with pagination
    /// Sorted by SentAt DESC (most recent first)
    /// </summary>
    public async Task<List<NotificationSummaryDto>> GetNotificationsByUserIdAsync(
        Guid userId, int page = 1, int pageSize = 50)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return notifications.Select(NotificationSummaryDto.FromEntity).ToList();
    }
    
    /// <summary>
    /// Get full notification detail including delivery attempt history
    /// </summary>
    public async Task<NotificationDetailDto?> GetNotificationDetailAsync(Guid id)
    {
        var notification = await _context.Notifications
            .Include(n => n.DeliveryAttempts)
            .FirstOrDefaultAsync(n => n.Id == id);
        
        if (notification == null)
            return null;
        
        return NotificationDetailDto.FromEntity(notification);
    }
    
    /// <summary>
    /// STATE TRANSITION: Delivered → Read
    /// Idempotent: Can be called multiple times safely
    /// </summary>
    public async Task<NotificationSummaryDto?> MarkAsReadAsync(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        
        if (notification == null)
            return null;
        
        // Validate state transition
        if (notification.Status != NotificationStatus.Delivered)
        {
            _logger.LogWarning(
                "Cannot mark notification {NotificationId} as read. Current status: {Status}",
                id, notification.Status);
            throw new InvalidOperationException(
                $"Cannot mark as read. Notification must be in Delivered state. Current state: {notification.Status}");
        }
        
        // Idempotent: If already read, just return
        if (notification.ReadAt != null)
        {
            return NotificationSummaryDto.FromEntity(notification);
        }
        
        notification.Status = NotificationStatus.Read;
        notification.ReadAt = DateTime.UtcNow;
        notification.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Marked notification {NotificationId} as read", id);
        
        return NotificationSummaryDto.FromEntity(notification);
    }
    
    /// <summary>
    /// STATE TRANSITION: Read → Acknowledged (TERMINAL STATE)
    /// Idempotent: Can be called multiple times safely
    /// </summary>
    public async Task<NotificationSummaryDto?> AcknowledgeAsync(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        
        if (notification == null)
            return null;
        
        // Validate state transition
        if (notification.Status != NotificationStatus.Read)
        {
            _logger.LogWarning(
                "Cannot acknowledge notification {NotificationId}. Current status: {Status}",
                id, notification.Status);
            throw new InvalidOperationException(
                $"Cannot acknowledge. Notification must be in Read state. Current state: {notification.Status}");
        }
        
        // Idempotent: If already acknowledged, just return
        if (notification.AcknowledgedAt != null)
        {
            return NotificationSummaryDto.FromEntity(notification);
        }
        
        notification.Status = NotificationStatus.Acknowledged;
        notification.AcknowledgedAt = DateTime.UtcNow;
        notification.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Acknowledged notification {NotificationId}", id);
        
        return NotificationSummaryDto.FromEntity(notification);
    }
    
    /// <summary>
    /// STATE TRANSITION: Failed → Retrying
    /// Creates new delivery attempt record
    /// </summary>
    public async Task<NotificationSummaryDto?> RetryDeliveryAsync(Guid id)
    {
        var notification = await _context.Notifications
            .Include(n => n.DeliveryAttempts)
            .FirstOrDefaultAsync(n => n.Id == id);
        
        if (notification == null)
            return null;
        
        // Validate state transition
        if (notification.Status != NotificationStatus.Failed)
        {
            _logger.LogWarning(
                "Cannot retry notification {NotificationId}. Current status: {Status}",
                id, notification.Status);
            throw new InvalidOperationException(
                $"Cannot retry. Notification must be in Failed state. Current state: {notification.Status}");
        }
        
        var now = DateTime.UtcNow;
        
        // Update notification status
        notification.Status = NotificationStatus.Retrying;
        notification.RetryCount++;
        notification.UpdatedAt = now;
        
        // Create new delivery attempt record
        var newAttempt = new DeliveryAttempt
        {
            Id = Guid.NewGuid(),
            NotificationId = notification.Id,
            AttemptNumber = notification.RetryCount + 1,
            AttemptedAt = now,
            Status = "Pending", // Will be updated by delivery worker
            Channel = notification.DeliveryChannel,
            CreatedAt = now
        };
        
        _context.DeliveryAttempts.Add(newAttempt);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation(
            "Initiated retry for notification {NotificationId}. Attempt #{AttemptNumber}",
            id, newAttempt.AttemptNumber);
        
        // TODO: Trigger actual delivery worker here
        // For now, simulate delivery after a delay
        
        return NotificationSummaryDto.FromEntity(notification);
    }
    
    /// <summary>
    /// Helper method to map Notification entity to SummaryDto
    /// </summary>
    // MapToSummaryDto removed - using static FromEntity method in DTO
}
