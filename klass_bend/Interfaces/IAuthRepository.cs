using klass_bend.Dtos;

namespace klass_bend.Interfaces
{
    public interface IAuthRepository
    {
        Task<LoginResultDto> LoginAsync(LoginDto dto);
        Task<UserDto?> GetUserByTokenAsync(string token);
    }
}

