namespace MedicationService.Models;

/// <summary>
/// Represents a medication schedule in the system.
/// This is a first-class domain entity as per architecture rules.
/// </summary>
public class Medication
{
    /// <summary>
    /// Unique identifier for the medication
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// ID of the user (elderly person) who takes this medication
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Name of the medication
    /// </summary>
    public string MedicationName { get; set; } = string.Empty;

    /// <summary>
    /// Dosage information (e.g., "500mg", "2 tablets")
    /// </summary>
    public string Dosage { get; set; } = string.Empty;

    /// <summary>
    /// Frequency description (e.g., "Daily", "Twice a day", "Every 8 hours")
    /// </summary>
    public string Frequency { get; set; } = string.Empty;

    /// <summary>
    /// Scheduled times in simple string format (e.g., "08:00, 20:00")
    /// </summary>
    public string ScheduledTimes { get; set; } = string.Empty;

    /// <summary>
    /// Additional instructions for taking the medication
    /// </summary>
    public string? Instructions { get; set; }

    /// <summary>
    /// Start date for this medication schedule
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Optional end date for this medication schedule
    /// </summary>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Timestamp when the medication was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the medication was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
