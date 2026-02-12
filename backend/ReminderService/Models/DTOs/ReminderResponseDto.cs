namespace ReminderService.Models.DTOs;

/// <summary>
/// Data Transfer Object for reminder responses
/// </summary>
public class ReminderResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public Guid ReferenceId { get; set; }
    public DateTime ScheduledTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Maps a Reminder entity to a response DTO
    /// </summary>
    public static ReminderResponseDto FromEntity(Reminder reminder)
    {
        return new ReminderResponseDto
        {
            Id = reminder.Id,
            UserId = reminder.UserId,
            Type = reminder.Type.ToString(),
            ReferenceId = reminder.ReferenceId,
            ScheduledTime = DateTime.SpecifyKind(reminder.ScheduledTime, DateTimeKind.Utc),
            Status = reminder.Status.ToString(),
            CreatedAt = DateTime.SpecifyKind(reminder.CreatedAt, DateTimeKind.Utc),
            UpdatedAt = DateTime.SpecifyKind(reminder.UpdatedAt, DateTimeKind.Utc)
        };
    }
}
