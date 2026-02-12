using Microsoft.AspNetCore.Mvc;
using NotificationService.Models.DTOs;
using NotificationService.Services;

namespace NotificationService.Controllers;

/// <summary>
/// DELIVERY DOMAIN: Notification API Controller
/// 
/// CRITICAL DOMAIN RULES:
/// 1. Notifications are SYSTEM-GENERATED (no POST endpoint for manual creation)
/// 2. Only LIMITED state updates allowed (Read, Acknowledge, Retry)
/// 3. NO editing of message content
/// 4. NO deletion of notifications (audit trail)
/// 
/// EXPOSED ENDPOINTS:
/// - GET /api/notifications - List notifications for current user
/// - GET /api/notifications/{id} - Get notification detail with delivery history
/// - PATCH /api/notifications/{id}/read - Mark as read (Delivered → Read)
/// - PATCH /api/notifications/{id}/acknowledge - Acknowledge (Read → Acknowledged)
/// - POST /api/notifications/{id}/retry - Retry failed delivery (Failed → Retrying)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationsController> _logger;
    
    public NotificationsController(
        INotificationService notificationService,
        ILogger<NotificationsController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }
    
    /// <summary>
    /// Get all notifications for a specific user
    /// Supports pagination, sorted by SentAt DESC
    /// </summary>
    /// <param name="userId">User ID to fetch notifications for</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 50, max: 100)</param>
    /// <returns>List of notification summaries</returns>
    [HttpGet]
    public async Task<ActionResult<List<NotificationSummaryDto>>> GetNotifications(
        [FromQuery] Guid userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (userId == Guid.Empty)
        {
            return BadRequest(new { message = "UserId is required" });
        }
        
        if (page < 1)
        {
            return BadRequest(new { message = "Page must be >= 1" });
        }
        
        if (pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new { message = "PageSize must be between 1 and 100" });
        }
        
        try
        {
            var notifications = await _notificationService.GetNotificationsByUserIdAsync(
                userId, page, pageSize);
            
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching notifications for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while fetching notifications" });
        }
    }
    
    /// <summary>
    /// Get full notification detail including delivery attempt history
    /// </summary>
    /// <param name="id">Notification ID</param>
    /// <returns>Notification detail with delivery history</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<NotificationDetailDto>> GetNotificationDetail(Guid id)
    {
        try
        {
            var notification = await _notificationService.GetNotificationDetailAsync(id);
            
            if (notification == null)
            {
                return NotFound(new { message = $"Notification {id} not found" });
            }
            
            return Ok(notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching notification detail {NotificationId}", id);
            return StatusCode(500, new { message = "An error occurred while fetching notification detail" });
        }
    }
    
    /// <summary>
    /// STATE TRANSITION: Delivered → Read
    /// Mark notification as read by recipient
    /// Idempotent operation
    /// </summary>
    /// <param name="id">Notification ID</param>
    /// <returns>Updated notification</returns>
    [HttpPatch("{id}/read")]
    public async Task<ActionResult<NotificationSummaryDto>> MarkAsRead(Guid id)
    {
        try
        {
            var notification = await _notificationService.MarkAsReadAsync(id);
            
            if (notification == null)
            {
                return NotFound(new { message = $"Notification {id} not found" });
            }
            
            return Ok(notification);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid state transition for notification {NotificationId}", id);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification {NotificationId} as read", id);
            return StatusCode(500, new { message = "An error occurred while marking notification as read" });
        }
    }
    
    /// <summary>
    /// STATE TRANSITION: Read → Acknowledged (TERMINAL STATE)
    /// Acknowledge notification receipt
    /// Idempotent operation
    /// </summary>
    /// <param name="id">Notification ID</param>
    /// <returns>Updated notification</returns>
    [HttpPatch("{id}/acknowledge")]
    public async Task<ActionResult<NotificationSummaryDto>> Acknowledge(Guid id)
    {
        try
        {
            var notification = await _notificationService.AcknowledgeAsync(id);
            
            if (notification == null)
            {
                return NotFound(new { message = $"Notification {id} not found" });
            }
            
            return Ok(notification);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid state transition for notification {NotificationId}", id);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error acknowledging notification {NotificationId}", id);
            return StatusCode(500, new { message = "An error occurred while acknowledging notification" });
        }
    }
    
    /// <summary>
    /// STATE TRANSITION: Failed → Retrying
    /// Retry failed notification delivery
    /// Creates new delivery attempt record
    /// </summary>
    /// <param name="id">Notification ID</param>
    /// <returns>Updated notification</returns>
    [HttpPost("{id}/retry")]
    public async Task<ActionResult<NotificationSummaryDto>> RetryDelivery(Guid id)
    {
        try
        {
            var notification = await _notificationService.RetryDeliveryAsync(id);
            
            if (notification == null)
            {
                return NotFound(new { message = $"Notification {id} not found" });
            }
            
            return Ok(notification);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid state transition for notification {NotificationId}", id);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying delivery for notification {NotificationId}", id);
            return StatusCode(500, new { message = "An error occurred while retrying delivery" });
        }
    }
    
    // ❌ PROHIBITED ENDPOINTS (explicitly NOT implemented):
    // - POST /api/notifications - Manual creation not allowed (system-generated only)
    // - PUT /api/notifications/{id} - Editing not allowed (immutable content)
    // - DELETE /api/notifications/{id} - Deletion not allowed (audit trail)

    /// <summary>
    /// INTERNAL SYSTEM ENDPOINT: Create notification from system event
    /// 
    /// CRITICAL: NOT exposed to public/user API
    /// Used ONLY by other internal services (e.g., ReminderService)
    /// 
    /// Validation:
    /// - Requires valid internal API key (TODO in future)
    /// - Creates notification and initial delivery attempt
    /// - Sets status to Sent
    /// </summary>
    /// <param name="dto">Notification creation data</param>
    /// <returns>Created notification summary</returns>
    [HttpPost("internal")]
    public async Task<ActionResult<NotificationSummaryDto>> CreateNotificationInternal([FromBody] CreateNotificationDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            // In a real system, we would validate an internal API key here
            // or rely on network-level security (e.g., K8s network policies)
            
            var notification = await _notificationService.CreateNotificationAsync(dto);
            
            _logger.LogInformation(
                "INTERNAL: Created notification {NotificationId} for user {UserId} from source {SourceId}", 
                notification.Id, dto.UserId, dto.SourceReminderId);
            
            return CreatedAtAction(
                nameof(GetNotificationDetail), 
                new { id = notification.Id }, 
                notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating internal notification");
            return StatusCode(500, new { message = "An error occurred while creating notification" });
        }
    }
}
