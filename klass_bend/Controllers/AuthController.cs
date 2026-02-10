using klass_bend.Dtos;
using klass_bend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace klass_bend.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;

        public AuthController(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authRepository.LoginAsync(dto);

            if (!result.Success)
                return Unauthorized(result.Error);

            if (string.IsNullOrEmpty(result.Token))
                return StatusCode(500, "Failed to generate authentication token.");

            Response.Cookies.Append("auth_token", result.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,             
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });


            return Ok(result);
        }


        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            if (!Request.Cookies.TryGetValue("auth_token", out var token))
                return Unauthorized();

            var userDto = await _authRepository.GetUserByTokenAsync(token);

            if (userDto == null)
                return Unauthorized();

            return Ok(userDto);
        }

    }


}
