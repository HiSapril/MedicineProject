namespace HealthTrackingService.Models;

/// <summary>
/// Represents a basic health log entry in the system.
/// This is a simple domain entity for storing health measurements.
/// </summary>
public class HealthLog
{
    /// <summary>
    /// Unique identifier for the health log
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// ID of the user (elderly person) who this health log belongs to
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Date when the health measurements were taken
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Blood pressure reading (e.g., "120/80")
    /// </summary>
    public string BloodPressure { get; set; } = string.Empty;

    /// <summary>
    /// Heart rate in beats per minute (optional)
    /// </summary>
    public int? HeartRate { get; set; }

    /// <summary>
    /// Optional note about the health status or observations
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// Timestamp when the health log was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the health log was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
