using System.ComponentModel.DataAnnotations;
using ReminderService.Models;

namespace ReminderService.Models.DTOs;

public class UpdateReminderDto
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public ReminderType Type { get; set; }

    [Required]
    public Guid ReferenceId { get; set; }

    [Required]
    public DateTime ScheduledTime { get; set; }
}
