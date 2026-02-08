using System.ComponentModel.DataAnnotations;

namespace MedicationService.Models.DTOs;

/// <summary>
/// Data Transfer Object for creating a new medication schedule
/// </summary>
public class CreateMedicationDto
{
    /// <summary>
    /// ID of the user who will take this medication
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Name of the medication
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string MedicationName { get; set; } = string.Empty;

    /// <summary>
    /// Dosage information
    /// </summary>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Dosage { get; set; } = string.Empty;

    /// <summary>
    /// Frequency description
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Frequency { get; set; } = string.Empty;

    /// <summary>
    /// Scheduled times (e.g., "08:00, 20:00")
    /// </summary>
    [Required]
    [StringLength(500, MinimumLength = 1)]
    public string ScheduledTimes { get; set; } = string.Empty;

    /// <summary>
    /// Optional instructions for taking the medication
    /// </summary>
    [StringLength(1000)]
    public string? Instructions { get; set; }

    /// <summary>
    /// Start date for the medication schedule
    /// </summary>
    [Required]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Optional end date for the medication schedule
    /// </summary>
    public DateTime? EndDate { get; set; }
}
