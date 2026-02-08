using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReminderService.Data;
using ReminderService.Models;
using ReminderService.Models.DTOs;

namespace ReminderService.Controllers;

/// <summary>
/// RESTful API controller for managing reminders.
/// This is a minimal implementation with in-memory storage.
/// NO scheduling logic or background services included.
/// </summary>
[ApiController]
[Route("api/reminders")]
[Produces("application/json")]
public class RemindersController : ControllerBase
{
    private readonly ReminderDbContext _context;
    private readonly ILogger<RemindersController> _logger;

    public RemindersController(ReminderDbContext context, ILogger<RemindersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all reminders
    /// </summary>
    /// <returns>List of all reminders</returns>
    /// <response code="200">Returns the list of reminders</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ReminderResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ReminderResponseDto>>> GetAll()
    {
        _logger.LogInformation("Retrieving all reminders");
        var reminders = await _context.Reminders.ToListAsync();
        var response = reminders.Select(ReminderResponseDto.FromEntity);
        return Ok(response);
    }

    /// <summary>
    /// Get a specific reminder by ID
    /// </summary>
    /// <param name="id">The reminder ID</param>
    /// <returns>The reminder if found</returns>
    /// <response code="200">Returns the reminder</response>
    /// <response code="404">If the reminder is not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ReminderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReminderResponseDto>> GetById(Guid id)
    {
        _logger.LogInformation("Retrieving reminder with ID: {ReminderId}", id);
        
        var reminder = await _context.Reminders.FindAsync(id);
        if (reminder == null)
        {
            _logger.LogWarning("Reminder with ID {ReminderId} not found", id);
            return NotFound(new { message = $"Reminder with ID {id} not found" });
        }

        return Ok(ReminderResponseDto.FromEntity(reminder));
    }

    /// <summary>
    /// Create a new reminder
    /// </summary>
    /// <param name="dto">The reminder data</param>
    /// <returns>The created reminder</returns>
    /// <response code="201">Returns the newly created reminder</response>
    /// <response code="400">If the data is invalid</response>
    [HttpPost]
    [ProducesResponseType(typeof(ReminderResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReminderResponseDto>> Create([FromBody] CreateReminderDto dto)
    {
        _logger.LogInformation("Creating new reminder for user {UserId}, type: {Type}", 
            dto.UserId, dto.Type);

        var now = DateTime.UtcNow;
        var reminder = new Reminder
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            Type = dto.Type,
            ReferenceId = dto.ReferenceId,
            ScheduledTime = dto.ScheduledTime,
            Status = ReminderStatus.Pending, // New reminders start as Pending
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.Reminders.Add(reminder);
        await _context.SaveChangesAsync();

        var response = ReminderResponseDto.FromEntity(reminder);
        return CreatedAtAction(nameof(GetById), new { id = reminder.Id }, response);
    }

    /// <summary>
    /// Update the status of a reminder
    /// </summary>
    /// <param name="id">The reminder ID</param>
    /// <param name="dto">The status update data</param>
    /// <returns>The updated reminder</returns>
    /// <response code="200">Returns the updated reminder</response>
    /// <response code="404">If the reminder is not found</response>
    /// <response code="400">If the data is invalid</response>
    [HttpPut("{id}/status")]
    [ProducesResponseType(typeof(ReminderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReminderResponseDto>> UpdateStatus(Guid id, [FromBody] UpdateReminderStatusDto dto)
    {
        _logger.LogInformation("Updating status for reminder {ReminderId} to {Status}", id, dto.Status);

        var reminder = await _context.Reminders.FindAsync(id);
        if (reminder == null)
        {
            _logger.LogWarning("Reminder with ID {ReminderId} not found", id);
            return NotFound(new { message = $"Reminder with ID {id} not found" });
        }

        reminder.Status = dto.Status;
        reminder.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = ReminderResponseDto.FromEntity(reminder);
        return Ok(response);
    }

    /// <summary>
    /// Delete a reminder
    /// </summary>
    /// <param name="id">The reminder ID</param>
    /// <returns>No content</returns>
    /// <response code="204">If the reminder was successfully deleted</response>
    /// <response code="404">If the reminder is not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting reminder with ID: {ReminderId}", id);

        var reminder = await _context.Reminders.FindAsync(id);
        if (reminder == null)
        {
            _logger.LogWarning("Reminder with ID {ReminderId} not found", id);
            return NotFound(new { message = $"Reminder with ID {id} not found" });
        }

        _context.Reminders.Remove(reminder);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Reminder with ID {ReminderId} deleted successfully", id);

        return NoContent();
    }
}
