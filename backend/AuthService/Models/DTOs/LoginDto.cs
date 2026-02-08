using System.ComponentModel.DataAnnotations;

namespace AuthService.Models.DTOs;

/// <summary>
/// Data Transfer Object for user login
/// </summary>
public class LoginDto
{
    /// <summary>
    /// Email address
    /// </summary>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Password
    /// </summary>
    [Required]
    public string Password { get; set; } = string.Empty;
}
