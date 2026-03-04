using klass_bend.Dtos.ClassRoom;

namespace klass_bend.Interfaces
{
    public interface IClassRepository
    {
        Task<ClassroomStateDto> GetClassroomStateAsync();
        Task<bool> UpdateFocusModeAsync(string mode);
        Task<bool> UpdateLockStatusAsync(bool isLocked);
        Task<bool> ResetClassroomStateAsync();
    }
}