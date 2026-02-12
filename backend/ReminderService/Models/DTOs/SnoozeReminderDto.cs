using System.ComponentModel.DataAnnotations;

namespace ReminderService.Models.DTOs;

public class SnoozeReminderDto
{
    [Required]
    [Range(1, 1440)] // Max 24 hours snooze
    public int Minutes { get; set; }
}
