using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AuthService.Models.DTOs;

/// <summary>
/// Data Transfer Object for user registration
/// </summary>
public class RegisterDto
{
    /// <summary>
    /// Full name of the user
    /// </summary>
    [JsonPropertyName("name")]
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Email address (used as username)
    /// </summary>
    [JsonPropertyName("email")]
    [Required]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Password (plain text for demo - real system needs hashing)
    /// </summary>
    [JsonPropertyName("password")]
    [Required]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// User role (0 = Elderly, 1 = Caregiver)
    /// </summary>
    [JsonPropertyName("role")]
    public int? Role { get; set; }
}
