using EngineerFlow.API.DTOs;
using EngineerFlow.API.Models;
using EngineerFlow.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngineerFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _authService.Authenticate(dto.Username, dto.Password);
        if (user == null) return Unauthorized(new { error = "Invalid username or password" });

        var token = _authService.GenerateToken(user);
        return Ok(new AuthResponseDto(token, user.Id, user.Username, user.Role.ToString()));
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var user = new User
        {
            Username = dto.Username,
            FullName = dto.FullName,
            Role = dto.Role
        };

        var registeredUser = await _authService.Register(user, dto.Password);
        var token = _authService.GenerateToken(registeredUser);
        
        return Ok(new AuthResponseDto(token, registeredUser.Id, registeredUser.Username, registeredUser.Role.ToString()));
    }
}
