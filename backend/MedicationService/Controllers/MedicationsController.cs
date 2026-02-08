using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicationService.Data;
using MedicationService.Models;
using MedicationService.Models.DTOs;

namespace MedicationService.Controllers;

/// <summary>
/// RESTful API controller for managing medication schedules.
/// This is a minimal implementation with in-memory storage for demonstration purposes.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MedicationsController : ControllerBase
{
    private readonly MedicationDbContext _context;
    private readonly ILogger<MedicationsController> _logger;

    public MedicationsController(MedicationDbContext context, ILogger<MedicationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all medication schedules
    /// </summary>
    /// <returns>List of all medications</returns>
    /// <response code="200">Returns the list of medications</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<MedicationResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<MedicationResponseDto>>> GetAll()
    {
        _logger.LogInformation("Retrieving all medications");
        var medications = await _context.Medications.ToListAsync();
        var response = medications.Select(MedicationResponseDto.FromEntity);
        return Ok(response);
    }

    /// <summary>
    /// Get a specific medication by ID
    /// </summary>
    /// <param name="id">The medication ID</param>
    /// <returns>The medication if found</returns>
    /// <response code="200">Returns the medication</response>
    /// <response code="404">If the medication is not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MedicationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MedicationResponseDto>> GetById(Guid id)
    {
        _logger.LogInformation("Retrieving medication with ID: {MedicationId}", id);
        
        var medication = await _context.Medications.FindAsync(id);
        if (medication == null)
        {
            _logger.LogWarning("Medication with ID {MedicationId} not found", id);
            return NotFound(new { message = $"Medication with ID {id} not found" });
        }

        return Ok(MedicationResponseDto.FromEntity(medication));
    }

    /// <summary>
    /// Create a new medication schedule
    /// </summary>
    /// <param name="dto">The medication data</param>
    /// <returns>The created medication</returns>
    /// <response code="201">Returns the newly created medication</response>
    /// <response code="400">If the data is invalid</response>
    [HttpPost]
    [ProducesResponseType(typeof(MedicationResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MedicationResponseDto>> Create([FromBody] CreateMedicationDto dto)
    {
        _logger.LogInformation("Creating new medication for user {UserId}", dto.UserId);

        var now = DateTime.UtcNow;
        var medication = new Medication
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            MedicationName = dto.MedicationName,
            Dosage = dto.Dosage,
            Frequency = dto.Frequency,
            ScheduledTimes = dto.ScheduledTimes,
            Instructions = dto.Instructions,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.Medications.Add(medication);
        await _context.SaveChangesAsync();

        var response = MedicationResponseDto.FromEntity(medication);
        return CreatedAtAction(nameof(GetById), new { id = medication.Id }, response);
    }

    /// <summary>
    /// Update an existing medication schedule
    /// </summary>
    /// <param name="id">The medication ID</param>
    /// <param name="dto">The updated medication data</param>
    /// <returns>The updated medication</returns>
    /// <response code="200">Returns the updated medication</response>
    /// <response code="404">If the medication is not found</response>
    /// <response code="400">If the data is invalid</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(MedicationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MedicationResponseDto>> Update(Guid id, [FromBody] UpdateMedicationDto dto)
    {
        _logger.LogInformation("Updating medication with ID: {MedicationId}", id);

        var medication = await _context.Medications.FindAsync(id);
        if (medication == null)
        {
            _logger.LogWarning("Medication with ID {MedicationId} not found", id);
            return NotFound(new { message = $"Medication with ID {id} not found" });
        }

        // Update only provided fields (partial update support)
        if (dto.MedicationName != null)
            medication.MedicationName = dto.MedicationName;
        
        if (dto.Dosage != null)
            medication.Dosage = dto.Dosage;
        
        if (dto.Frequency != null)
            medication.Frequency = dto.Frequency;
        
        if (dto.ScheduledTimes != null)
            medication.ScheduledTimes = dto.ScheduledTimes;
        
        if (dto.Instructions != null)
            medication.Instructions = dto.Instructions;
        
        if (dto.StartDate.HasValue)
            medication.StartDate = dto.StartDate.Value;
        
        if (dto.EndDate.HasValue)
            medication.EndDate = dto.EndDate;

        medication.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = MedicationResponseDto.FromEntity(medication);
        return Ok(response);
    }

    /// <summary>
    /// Delete a medication schedule
    /// </summary>
    /// <param name="id">The medication ID</param>
    /// <returns>No content</returns>
    /// <response code="204">If the medication was successfully deleted</response>
    /// <response code="404">If the medication is not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting medication with ID: {MedicationId}", id);

        var medication = await _context.Medications.FindAsync(id);
        if (medication == null)
        {
            _logger.LogWarning("Medication with ID {MedicationId} not found", id);
            return NotFound(new { message = $"Medication with ID {id} not found" });
        }

        _context.Medications.Remove(medication);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Medication with ID {MedicationId} deleted successfully", id);

        return NoContent();
    }
}
