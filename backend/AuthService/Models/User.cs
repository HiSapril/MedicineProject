namespace AuthService.Models;

/// <summary>
/// User roles in the system
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Elderly person receiving care
    /// </summary>
    Elderly,
    
    /// <summary>
    /// Caregiver managing elderly person's care
    /// </summary>
    Caregiver
}

/// <summary>
/// Represents a user in the authentication system.
/// This is a simplified domain entity for academic demo purposes.
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Full name of the user
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Email address (used as username)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Password (stored as plain text for demo only - NOT for production)
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// User's role in the system
    /// </summary>
    public UserRole Role { get; set; }

    /// <summary>
    /// Timestamp when the user account was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
