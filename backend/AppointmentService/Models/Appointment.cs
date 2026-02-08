namespace AppointmentService.Models;

/// <summary>
/// Represents a medical appointment in the system.
/// This is a first-class domain entity as per architecture rules.
/// </summary>
public class Appointment
{
    /// <summary>
    /// Unique identifier for the appointment
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// ID of the user (elderly person) who has this appointment
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Name of the doctor for this appointment
    /// </summary>
    public string DoctorName { get; set; } = string.Empty;

    /// <summary>
    /// Location where the appointment will take place
    /// </summary>
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Date and time of the appointment
    /// </summary>
    public DateTime AppointmentDate { get; set; }

    /// <summary>
    /// Additional notes or instructions for the appointment
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Timestamp when the appointment was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the appointment was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
