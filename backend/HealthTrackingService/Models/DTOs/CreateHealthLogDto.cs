using System.ComponentModel.DataAnnotations;

namespace HealthTrackingService.Models.DTOs;

/// <summary>
/// Data Transfer Object for creating a new health log entry
/// </summary>
public class CreateHealthLogDto
{
    /// <summary>
    /// ID of the user for this health log
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Date of the health measurements
    /// </summary>
    [Required]
    public DateTime Date { get; set; }

    /// <summary>
    /// Blood pressure reading (e.g., "120/80")
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string BloodPressure { get; set; } = string.Empty;

    /// <summary>
    /// Heart rate in beats per minute (optional)
    /// </summary>
    [Range(30, 300)]
    public int? HeartRate { get; set; }

    /// <summary>
    /// Optional note about health status
    /// </summary>
    [StringLength(1000)]
    public string? Note { get; set; }
}
