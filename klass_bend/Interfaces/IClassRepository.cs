using klass_bend.Dtos.ClassRoom;

namespace klass_bend.Interfaces
{
    public interface IClassRepository
    {
        Task<ClassroomStateDto> GetClassroomStateAsync();
        Task<bool> UpdateFocusModeAsync(string mode);
        Task<bool> UpdateLockStatusAsync(bool isLocked, bool isSynced);
        Task<bool> UpdateClassroomLayoutAsync(string mode, bool isLocked, bool isSynced);
        Task<bool> ResetClassroomStateAsync();
    }
}