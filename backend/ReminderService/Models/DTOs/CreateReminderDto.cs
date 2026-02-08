using System.ComponentModel.DataAnnotations;

namespace ReminderService.Models.DTOs;

/// <summary>
/// Data Transfer Object for creating a new reminder
/// </summary>
public class CreateReminderDto
{
    /// <summary>
    /// ID of the user for this reminder
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Type of reminder (0 = Medication, 1 = Appointment, 2 = Exercise)
    /// </summary>
    [Required]
    public ReminderType Type { get; set; }

    /// <summary>
    /// Reference ID to the source entity (Medication or Appointment ID)
    /// </summary>
    [Required]
    public Guid ReferenceId { get; set; }

    /// <summary>
    /// Scheduled time for the reminder
    /// </summary>
    [Required]
    public DateTime ScheduledTime { get; set; }
}
