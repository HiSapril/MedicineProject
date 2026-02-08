using System.ComponentModel.DataAnnotations;

namespace AppointmentService.Models.DTOs;

/// <summary>
/// Data Transfer Object for updating an existing appointment.
/// All fields are optional to support partial updates.
/// </summary>
public class UpdateAppointmentDto
{
    /// <summary>
    /// Updated doctor name
    /// </summary>
    [StringLength(200, MinimumLength = 1)]
    public string? DoctorName { get; set; }

    /// <summary>
    /// Updated location
    /// </summary>
    [StringLength(500, MinimumLength = 1)]
    public string? Location { get; set; }

    /// <summary>
    /// Updated appointment date and time
    /// </summary>
    public DateTime? AppointmentDate { get; set; }

    /// <summary>
    /// Updated notes
    /// </summary>
    [StringLength(1000)]
    public string? Notes { get; set; }
}
