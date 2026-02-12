namespace AppointmentService.Models.DTOs;

/// <summary>
/// Data Transfer Object for appointment responses
/// </summary>
public class AppointmentResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Maps an Appointment entity to a response DTO
    /// </summary>
    public static AppointmentResponseDto FromEntity(Appointment appointment)
    {
        return new AppointmentResponseDto
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            DoctorName = appointment.DoctorName,
            Location = appointment.Location,
            AppointmentDate = DateTime.SpecifyKind(appointment.AppointmentDate, DateTimeKind.Utc),
            Notes = appointment.Notes,
            CreatedAt = DateTime.SpecifyKind(appointment.CreatedAt, DateTimeKind.Utc),
            UpdatedAt = DateTime.SpecifyKind(appointment.UpdatedAt, DateTimeKind.Utc)
        };
    }
}
