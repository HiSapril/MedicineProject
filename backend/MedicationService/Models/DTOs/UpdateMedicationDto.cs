using System.ComponentModel.DataAnnotations;

namespace MedicationService.Models.DTOs;

/// <summary>
/// Data Transfer Object for updating an existing medication schedule.
/// All fields are optional to support partial updates.
/// </summary>
public class UpdateMedicationDto
{
    /// <summary>
    /// Updated medication name
    /// </summary>
    [StringLength(200, MinimumLength = 1)]
    public string? MedicationName { get; set; }

    /// <summary>
    /// Updated dosage
    /// </summary>
    [StringLength(100, MinimumLength = 1)]
    public string? Dosage { get; set; }

    /// <summary>
    /// Updated frequency
    /// </summary>
    [StringLength(200, MinimumLength = 1)]
    public string? Frequency { get; set; }

    /// <summary>
    /// Updated scheduled times
    /// </summary>
    [StringLength(500, MinimumLength = 1)]
    public string? ScheduledTimes { get; set; }

    /// <summary>
    /// Updated instructions
    /// </summary>
    [StringLength(1000)]
    public string? Instructions { get; set; }

    /// <summary>
    /// Updated start date
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Updated end date
    /// </summary>
    public DateTime? EndDate { get; set; }
}
