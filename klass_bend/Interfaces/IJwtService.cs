using klass_bend.Dtos;
using klass_bend.Models;
using System.Security.Claims;

namespace klass_bend.Interfaces
{
    public interface IJwtService
    {
        Task<string> GenerateTokenAsync(User user);
        ClaimsPrincipal? ValidateToken(string token);

        string GenerateJitsiToken(User user, string staticId, bool isModerator, string roomName);
    }
}
