namespace AuthService.Models.DTOs;

/// <summary>
/// Data Transfer Object for authentication response
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// User ID
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// User's full name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// User's email
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's role
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Authentication token (placeholder for demo - will be JWT in production)
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Creates a response DTO from a User entity
    /// </summary>
    public static AuthResponseDto FromUser(User user, string token)
    {
        return new AuthResponseDto
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString(),
            Token = token
        };
    }
}
