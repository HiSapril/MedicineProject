namespace MedicationService.Models.DTOs;

/// <summary>
/// Data Transfer Object for medication responses
/// </summary>
public class MedicationResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string ScheduledTimes { get; set; } = string.Empty;
    public string? Instructions { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Maps a Medication entity to a response DTO
    /// </summary>
    public static MedicationResponseDto FromEntity(Medication medication)
    {
        return new MedicationResponseDto
        {
            Id = medication.Id,
            UserId = medication.UserId,
            MedicationName = medication.MedicationName,
            Dosage = medication.Dosage,
            Frequency = medication.Frequency,
            ScheduledTimes = medication.ScheduledTimes,
            Instructions = medication.Instructions,
            StartDate = DateTime.SpecifyKind(medication.StartDate, DateTimeKind.Utc),
            EndDate = medication.EndDate.HasValue ? DateTime.SpecifyKind(medication.EndDate.Value, DateTimeKind.Utc) : null,
            CreatedAt = DateTime.SpecifyKind(medication.CreatedAt, DateTimeKind.Utc),
            UpdatedAt = DateTime.SpecifyKind(medication.UpdatedAt, DateTimeKind.Utc)
        };
    }
}
