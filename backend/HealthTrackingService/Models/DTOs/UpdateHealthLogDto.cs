using System.ComponentModel.DataAnnotations;

namespace HealthTrackingService.Models.DTOs;

/// <summary>
/// Data Transfer Object for updating an existing health log.
/// All fields are optional to support partial updates.
/// </summary>
public class UpdateHealthLogDto
{
    /// <summary>
    /// Updated date
    /// </summary>
    public DateTime? Date { get; set; }

    /// <summary>
    /// Updated blood pressure reading
    /// </summary>
    [StringLength(50, MinimumLength = 1)]
    public string? BloodPressure { get; set; }

    /// <summary>
    /// Updated heart rate
    /// </summary>
    [Range(30, 300)]
    public int? HeartRate { get; set; }

    /// <summary>
    /// Updated note
    /// </summary>
    [StringLength(1000)]
    public string? Note { get; set; }

    /// <summary>
    /// Updated weight
    /// </summary>
    [Range(20, 500)]
    public double? Weight { get; set; }
}
