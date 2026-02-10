using klass_bend.Dtos;
using klass_bend.Interfaces;
using klass_bend.Models;
using Microsoft.AspNetCore.Identity;

namespace klass_bend.Services
{
    public class AuthRepository : IAuthRepository
    {
        private readonly UserManager<User> _userManager;
        private readonly IJwtService _jwtService;

        public AuthRepository(UserManager<User> userManager, IJwtService jwtRepository)
        {
            _userManager = userManager;
            _jwtService = jwtRepository;
        }

        public async Task<LoginResultDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.UserName);

            if (user == null || !user.IsActive)
                return new LoginResultDto { Success = false, Error = "Invalid credentials" };

            var validPassword = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!validPassword)
                return new LoginResultDto { Success = false, Error = "Invalid credentials" };

            var token = await _jwtService.GenerateTokenAsync(user);

            var roles = await _userManager.GetRolesAsync(user); // returns IList<string>
            var role = roles.FirstOrDefault() ?? "Student";

            return new LoginResultDto
            {
                Success = true,
                Token = token,
                UserId = int.TryParse(user.Id, out var id) ? id : 0, 
                UserName = user.UserName!,
                Role = role
            };
        }

        public async Task<UserDto?> GetUserByTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
                return null;

            var principal = _jwtService.ValidateToken(token);
            if (principal == null)
                return null;

            // Extract username from claims
            var userName = principal.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
                return null;

            // Get the user entity
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                return null;

            // Get roles
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "Student";

            // Map to DTO
            return new UserDto
            {
                Id = user.Id ?? "",
                UserName = user.UserName ?? "",
                Role = role
            };
        }



    }
}
