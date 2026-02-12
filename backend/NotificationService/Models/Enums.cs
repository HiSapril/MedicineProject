namespace NotificationService.Models;

/// <summary>
/// DELIVERY DOMAIN: Notification Status Lifecycle
/// 
/// State Transition Rules:
/// - Sent → Delivered (successful delivery)
/// - Sent → Failed (delivery failure)
/// - Delivered → Read (user opens notification)
/// - Read → Acknowledged (user confirms receipt) [TERMINAL STATE]
/// - Failed → Retrying (retry attempt initiated)
/// - Retrying → Delivered (retry successful)
/// - Retrying → Failed (retry failed)
/// 
/// CRITICAL: Acknowledged is a TERMINAL STATE. No transitions allowed after this.
/// </summary>
public enum NotificationStatus
{
    /// <summary>
    /// Notification has been sent but delivery not yet confirmed
    /// </summary>
    Sent = 0,
    
    /// <summary>
    /// Notification successfully delivered to recipient device/channel
    /// </summary>
    Delivered = 1,
    
    /// <summary>
    /// Recipient has opened/viewed the notification
    /// </summary>
    Read = 2,
    
    /// <summary>
    /// Recipient has explicitly acknowledged the notification (TERMINAL STATE)
    /// </summary>
    Acknowledged = 3,
    
    /// <summary>
    /// Delivery attempt failed
    /// </summary>
    Failed = 4,
    
    /// <summary>
    /// Retry delivery in progress
    /// </summary>
    Retrying = 5
}

/// <summary>
/// Delivery channels for notifications
/// </summary>
public enum DeliveryChannel
{
    /// <summary>
    /// Mobile push notification (iOS/Android)
    /// </summary>
    MobilePush = 0,
    
    /// <summary>
    /// Email notification
    /// </summary>
    Email = 1,
    
    /// <summary>
    /// In-app notification (web/mobile app)
    /// </summary>
    InApp = 2,
    
    /// <summary>
    /// SMS text message
    /// </summary>
    SMS = 3
}

/// <summary>
/// Type of recipient for the notification
/// </summary>
public enum RecipientType
{
    /// <summary>
    /// Elderly user (primary care recipient)
    /// </summary>
    ElderlyUser = 0,
    
    /// <summary>
    /// Caregiver (family member, professional caregiver)
    /// </summary>
    Caregiver = 1
}

/// <summary>
/// Source event type that triggered the reminder
/// </summary>
public enum SourceEventType
{
    Medication = 0,
    Appointment = 1,
    Health = 2
}
