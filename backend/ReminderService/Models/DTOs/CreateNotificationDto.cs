using System.ComponentModel.DataAnnotations;

namespace ReminderService.Models.DTOs;

public class CreateNotificationDto
{
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    public Guid SourceReminderId { get; set; }
    
    [Required]
    public int SourceEventType { get; set; } // 0=Medication, 1=Appointment, 2=Health
    
    [Required]
    public Guid SourceEventId { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    [Required]
    public int DeliveryChannel { get; set; } // 0=MobilePush
    
    [Required]
    public int RecipientType { get; set; } // 0=ElderlyUser
}
