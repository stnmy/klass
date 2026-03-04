using System.Security.Claims;
using klass_bend.Models;

namespace klass_bend.Interfaces
{
    public interface IJwtService
    {
        Task<string> GenerateTokenAsync(User user);
        ClaimsPrincipal? ValidateToken(string token);

        string GenerateJitsiToken(User user, string staticId, bool isModerator, string roomName);
    }
}
