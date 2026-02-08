using System.ComponentModel.DataAnnotations;

namespace ReminderService.Models.DTOs;

/// <summary>
/// Data Transfer Object for updating reminder status
/// </summary>
public class UpdateReminderStatusDto
{
    /// <summary>
    /// New status for the reminder (0 = Pending, 1 = Done, 2 = Missed)
    /// </summary>
    [Required]
    public ReminderStatus Status { get; set; }
}
