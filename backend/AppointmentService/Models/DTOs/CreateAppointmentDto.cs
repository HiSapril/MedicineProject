using System.ComponentModel.DataAnnotations;

namespace AppointmentService.Models.DTOs;

/// <summary>
/// Data Transfer Object for creating a new appointment
/// </summary>
public class CreateAppointmentDto
{
    /// <summary>
    /// ID of the user who will have this appointment
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Name of the doctor
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string DoctorName { get; set; } = string.Empty;

    /// <summary>
    /// Location of the appointment
    /// </summary>
    [Required]
    [StringLength(500, MinimumLength = 1)]
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Date and time of the appointment
    /// </summary>
    [Required]
    public DateTime AppointmentDate { get; set; }

    /// <summary>
    /// Optional notes for the appointment
    /// </summary>
    [StringLength(1000)]
    public string? Notes { get; set; }
}
