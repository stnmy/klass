using klass_bend.Dtos;
using klass_bend.Models;
using Microsoft.AspNetCore.Identity;

namespace klass_bend.Interfaces
{
    public interface IUserRepository
    {
        Task<IdentityResult> CreateStudentAsync(CreateStudentDto dto);
        Task<IEnumerable<StudentListDto>> GetAllStudentsAsync();
        // Inside IUserRepository.cs
        Task<bool> AssignStudentsToJitsiAsync(List<string> emails, List<string> userNames, string teacherEmail);
        Task ClearJitsiSessionAsync(string teacherEmail);
        Task<JitsiLinkDto?> GetClassroomAccessAsync(string email);
        Task<bool> IsUserInActiveSessionAsync(string email);
        Task<IEnumerable<string>> GetActiveStudentEmailsAsync();
        Task<bool> CreateGroupAsync(CreateGroupDto dto, string teacherId);
        Task<bool> AddStudentsToGroupAsync(GroupActionDto dto);
        Task<bool> RemoveStudentsFromGroupAsync(GroupActionDto dto);
        Task<bool> DeleteGroupAsync(int groupId, string teacherId);
        Task<IEnumerable<Group>> GetTeacherGroupsAsync(string teacherId);
        Task<IEnumerable<StudentListDto>> GetStudentsByGroupIdAsync(int groupId);
        Task<IdentityResult> UpdateStudentAsync(string id, UpdateStudentDto dto);
        Task<StudentDetailsDto?> GetStudentByIdAsync(string id);
        Task<IdentityResult> DeleteStudentAsync(string id);
    }
}
