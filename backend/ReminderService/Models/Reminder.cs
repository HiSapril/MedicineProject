namespace ReminderService.Models;

/// <summary>
/// Type of reminder
/// </summary>
public enum ReminderType
{
    /// <summary>
    /// Reminder for medication
    /// </summary>
    Medication,
    
    /// <summary>
    /// Reminder for appointment
    /// </summary>
    Appointment,
    
    /// <summary>
    /// Reminder for exercise
    /// </summary>
    Exercise
}

/// <summary>
/// Status of reminder
/// </summary>
public enum ReminderStatus
{
    /// <summary>
    /// Reminder is pending/scheduled
    /// </summary>
    Pending,
    
    /// <summary>
    /// Reminder was completed/acknowledged
    /// </summary>
    Done,
    
    /// <summary>
    /// Reminder was missed
    /// </summary>
    Missed
}

/// <summary>
/// Represents a reminder in the system.
/// This entity stores reminder data without scheduling logic.
/// </summary>
public class Reminder
{
    /// <summary>
    /// Unique identifier for the reminder
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// ID of the user this reminder belongs to
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Type of reminder (Medication, Appointment, Exercise)
    /// </summary>
    public ReminderType Type { get; set; }

    /// <summary>
    /// Reference ID linking to the source entity (Medication ID or Appointment ID)
    /// </summary>
    public Guid ReferenceId { get; set; }

    /// <summary>
    /// Scheduled time for this reminder
    /// </summary>
    public DateTime ScheduledTime { get; set; }

    /// <summary>
    /// Current status of the reminder
    /// </summary>
    public ReminderStatus Status { get; set; }

    /// <summary>
    /// Timestamp when the reminder was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the reminder was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
