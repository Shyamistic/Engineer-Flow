using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EngineerFlow.API.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; } = UserRole.User;

    public string? FullName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum UserRole { User, Engineer, Admin }
