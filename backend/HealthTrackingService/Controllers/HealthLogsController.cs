using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HealthTrackingService.Data;
using HealthTrackingService.Models;
using HealthTrackingService.Models.DTOs;

namespace HealthTrackingService.Controllers;

/// <summary>
/// RESTful API controller for managing health logs.
/// This is a minimal implementation with in-memory storage for demonstration purposes.
/// </summary>
[ApiController]
[Route("api/health-logs")]
[Produces("application/json")]
public class HealthLogsController : ControllerBase
{
    private readonly HealthDbContext _context;
    private readonly ILogger<HealthLogsController> _logger;

    public HealthLogsController(HealthDbContext context, ILogger<HealthLogsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all health logs
    /// </summary>
    /// <returns>List of all health logs</returns>
    /// <response code="200">Returns the list of health logs</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<HealthLogResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<HealthLogResponseDto>>> GetAll()
    {
        _logger.LogInformation("Retrieving all health logs");
        var healthLogs = await _context.HealthLogs.ToListAsync();
        var response = healthLogs.Select(HealthLogResponseDto.FromEntity);
        return Ok(response);
    }

    /// <summary>
    /// Get a specific health log by ID
    /// </summary>
    /// <param name="id">The health log ID</param>
    /// <returns>The health log if found</returns>
    /// <response code="200">Returns the health log</response>
    /// <response code="404">If the health log is not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(HealthLogResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<HealthLogResponseDto>> GetById(Guid id)
    {
        _logger.LogInformation("Retrieving health log with ID: {HealthLogId}", id);
        
        var healthLog = await _context.HealthLogs.FindAsync(id);
        if (healthLog == null)
        {
            _logger.LogWarning("Health log with ID {HealthLogId} not found", id);
            return NotFound(new { message = $"Health log with ID {id} not found" });
        }

        return Ok(HealthLogResponseDto.FromEntity(healthLog));
    }

    /// <summary>
    /// Create a new health log entry
    /// </summary>
    /// <param name="dto">The health log data</param>
    /// <returns>The created health log</returns>
    /// <response code="201">Returns the newly created health log</response>
    /// <response code="400">If the data is invalid</response>
    [HttpPost]
    [ProducesResponseType(typeof(HealthLogResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<HealthLogResponseDto>> Create([FromBody] CreateHealthLogDto dto)
    {
        _logger.LogInformation("Creating new health log for user {UserId}", dto.UserId);

        var now = DateTime.UtcNow;
        var healthLog = new HealthLog
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            Date = dto.Date,
            BloodPressure = dto.BloodPressure,
            HeartRate = dto.HeartRate,
            Note = dto.Note,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.HealthLogs.Add(healthLog);
        await _context.SaveChangesAsync();

        var response = HealthLogResponseDto.FromEntity(healthLog);
        return CreatedAtAction(nameof(GetById), new { id = healthLog.Id }, response);
    }

    /// <summary>
    /// Update an existing health log
    /// </summary>
    /// <param name="id">The health log ID</param>
    /// <param name="dto">The updated health log data</param>
    /// <returns>The updated health log</returns>
    /// <response code="200">Returns the updated health log</response>
    /// <response code="404">If the health log is not found</response>
    /// <response code="400">If the data is invalid</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(HealthLogResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<HealthLogResponseDto>> Update(Guid id, [FromBody] UpdateHealthLogDto dto)
    {
        _logger.LogInformation("Updating health log with ID: {HealthLogId}", id);

        var healthLog = await _context.HealthLogs.FindAsync(id);
        if (healthLog == null)
        {
            _logger.LogWarning("Health log with ID {HealthLogId} not found", id);
            return NotFound(new { message = $"Health log with ID {id} not found" });
        }

        // Update only provided fields (partial update support)
        if (dto.Date.HasValue)
            healthLog.Date = dto.Date.Value;
        
        if (dto.BloodPressure != null)
            healthLog.BloodPressure = dto.BloodPressure;
        
        if (dto.HeartRate.HasValue)
            healthLog.HeartRate = dto.HeartRate;
        
        if (dto.Note != null)
            healthLog.Note = dto.Note;

        healthLog.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = HealthLogResponseDto.FromEntity(healthLog);
        return Ok(response);
    }

    /// <summary>
    /// Delete a health log
    /// </summary>
    /// <param name="id">The health log ID</param>
    /// <returns>No content</returns>
    /// <response code="204">If the health log was successfully deleted</response>
    /// <response code="404">If the health log is not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting health log with ID: {HealthLogId}", id);

        var healthLog = await _context.HealthLogs.FindAsync(id);
        if (healthLog == null)
        {
            _logger.LogWarning("Health log with ID {HealthLogId} not found", id);
            return NotFound(new { message = $"Health log with ID {id} not found" });
        }

        _context.HealthLogs.Remove(healthLog);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Health log with ID {HealthLogId} deleted successfully", id);

        return NoContent();
    }
}
