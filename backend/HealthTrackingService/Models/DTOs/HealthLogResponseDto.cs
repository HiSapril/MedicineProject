namespace HealthTrackingService.Models.DTOs;

/// <summary>
/// Data Transfer Object for health log responses
/// </summary>
public class HealthLogResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime Date { get; set; }
    public string BloodPressure { get; set; } = string.Empty;
    public int? HeartRate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Maps a HealthLog entity to a response DTO
    /// </summary>
    public static HealthLogResponseDto FromEntity(HealthLog healthLog)
    {
        return new HealthLogResponseDto
        {
            Id = healthLog.Id,
            UserId = healthLog.UserId,
            Date = healthLog.Date,
            BloodPressure = healthLog.BloodPressure,
            HeartRate = healthLog.HeartRate,
            Note = healthLog.Note,
            CreatedAt = healthLog.CreatedAt,
            UpdatedAt = healthLog.UpdatedAt
        };
    }
}
