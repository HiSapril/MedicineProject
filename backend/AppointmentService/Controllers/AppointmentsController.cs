using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppointmentService.Data;
using AppointmentService.Models;
using AppointmentService.Models.DTOs;

namespace AppointmentService.Controllers;

/// <summary>
/// RESTful API controller for managing appointments.
/// This is a minimal implementation with in-memory storage for demonstration purposes.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AppointmentsController : ControllerBase
{
    private readonly AppointmentDbContext _context;
    private readonly ILogger<AppointmentsController> _logger;

    public AppointmentsController(AppointmentDbContext context, ILogger<AppointmentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all appointments
    /// </summary>
    /// <returns>List of all appointments</returns>
    /// <response code="200">Returns the list of appointments</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AppointmentResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetAll()
    {
        _logger.LogInformation("Retrieving all appointments");
        var appointments = await _context.Appointments.ToListAsync();
        var response = appointments.Select(AppointmentResponseDto.FromEntity);
        return Ok(response);
    }

    /// <summary>
    /// Get a specific appointment by ID
    /// </summary>
    /// <param name="id">The appointment ID</param>
    /// <returns>The appointment if found</returns>
    /// <response code="200">Returns the appointment</response>
    /// <response code="404">If the appointment is not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AppointmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AppointmentResponseDto>> GetById(Guid id)
    {
        _logger.LogInformation("Retrieving appointment with ID: {AppointmentId}", id);
        
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null)
        {
            _logger.LogWarning("Appointment with ID {AppointmentId} not found", id);
            return NotFound(new { message = $"Appointment with ID {id} not found" });
        }

        return Ok(AppointmentResponseDto.FromEntity(appointment));
    }

    /// <summary>
    /// Create a new appointment
    /// </summary>
    /// <param name="dto">The appointment data</param>
    /// <returns>The created appointment</returns>
    /// <response code="201">Returns the newly created appointment</response>
    /// <response code="400">If the data is invalid</response>
    [HttpPost]
    [ProducesResponseType(typeof(AppointmentResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AppointmentResponseDto>> Create([FromBody] CreateAppointmentDto dto)
    {
        _logger.LogInformation("Creating new appointment for user {UserId}", dto.UserId);

        var now = DateTime.UtcNow;
        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            DoctorName = dto.DoctorName,
            Location = dto.Location,
            AppointmentDate = dto.AppointmentDate,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        var response = AppointmentResponseDto.FromEntity(appointment);
        return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, response);
    }

    /// <summary>
    /// Update an existing appointment
    /// </summary>
    /// <param name="id">The appointment ID</param>
    /// <param name="dto">The updated appointment data</param>
    /// <returns>The updated appointment</returns>
    /// <response code="200">Returns the updated appointment</response>
    /// <response code="404">If the appointment is not found</response>
    /// <response code="400">If the data is invalid</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AppointmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AppointmentResponseDto>> Update(Guid id, [FromBody] UpdateAppointmentDto dto)
    {
        _logger.LogInformation("Updating appointment with ID: {AppointmentId}", id);

        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null)
        {
            _logger.LogWarning("Appointment with ID {AppointmentId} not found", id);
            return NotFound(new { message = $"Appointment with ID {id} not found" });
        }

        // Update only provided fields (partial update support)
        if (dto.DoctorName != null)
            appointment.DoctorName = dto.DoctorName;
        
        if (dto.Location != null)
            appointment.Location = dto.Location;
        
        if (dto.AppointmentDate.HasValue)
            appointment.AppointmentDate = dto.AppointmentDate.Value;
        
        if (dto.Notes != null)
            appointment.Notes = dto.Notes;

        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = AppointmentResponseDto.FromEntity(appointment);
        return Ok(response);
    }

    /// <summary>
    /// Delete an appointment
    /// </summary>
    /// <param name="id">The appointment ID</param>
    /// <returns>No content</returns>
    /// <response code="204">If the appointment was successfully deleted</response>
    /// <response code="404">If the appointment is not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting appointment with ID: {AppointmentId}", id);

        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null)
        {
            _logger.LogWarning("Appointment with ID {AppointmentId} not found", id);
            return NotFound(new { message = $"Appointment with ID {id} not found" });
        }

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Appointment with ID {AppointmentId} deleted successfully", id);

        return NoContent();
    }
}
