using klass_bend.Dtos;
using klass_bend.Models;

namespace klass_bend.Interfaces
{
    public interface IAuthRepository
    {
        Task<LoginResultDto> LoginAsync(LoginDto dto);
        Task<UserDto?> GetUserByTokenAsync(string token);
    }
}

