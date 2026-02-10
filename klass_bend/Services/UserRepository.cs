using klass_bend.Data;
using klass_bend.Dtos;
using klass_bend.Interfaces;
using klass_bend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace klass_bend.Services
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _applicationDbContext;
        private readonly IJwtService _jwtService;
        private readonly IConfiguration _configuration;

        public UserRepository(UserManager<User> userManager, 
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext applicationDbContext,
            IJwtService jwtService,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _applicationDbContext = applicationDbContext;
            _jwtService = jwtService;
            _configuration = configuration;
        }


        public async Task<IdentityResult> CreateStudentAsync(CreateStudentDto dto)
        {
            if (!await _roleManager.RoleExistsAsync("Student"))
            {
                await _roleManager.CreateAsync(new IdentityRole("Student"));
            }

            var user = new User
            {
                UserName = dto.UserName,
                Email = dto.Email,
                Gender = dto.Gender,
                NationalId = dto.NationalId,
                IdCardNumber = dto.IdCardNumber,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if(!result.Succeeded)
            {
                return result;
            }

            await _userManager.AddToRoleAsync(user, "Student");
            return result;
        }

        public async Task<IEnumerable<StudentListDto>> GetAllStudentsAsync()
        {
            var students = await _userManager.GetUsersInRoleAsync("Student");

            return students
                .Select(u => new StudentListDto
                {
                    Id = u.Id, // Map the ID here
                    UserName = u.UserName!,
                    Email = u.Email!
                })
                .ToList();
        }

        public async Task<bool> AssignStudentsToJitsiAsync(List<string> emails, string teacherEmail)
        {
            if (!emails.Contains(teacherEmail))
            {
                emails.Insert(0, teacherEmail);
            }

            var availableSlots = await _applicationDbContext.JitsiSessions
                .Where(s => !s.IsOccupied)
                .OrderBy(s => s.JitsiUserStaticId)
                .ToListAsync();

            if (availableSlots.Count < emails.Count)
            {
                return false;
            }

            for (int i = 0; i < emails.Count; i++)
            {
                availableSlots[i].UserEmail = emails[i];
            }

            await _applicationDbContext.SaveChangesAsync();
            return true;
        }


        public async Task ClearJitsiSessionAsync(string teacherEmail)
        {
            // Clear everyone EXCEPT the teacher
            var slotsToClear = await _applicationDbContext.JitsiSessions
                .Where(s => s.UserEmail != teacherEmail)
                .ToListAsync();

            foreach (var slot in slotsToClear)
            {
                slot.UserEmail = null;
                slot.IsOccupied = false;
                slot.JoinedAt = null;
            }

            await _applicationDbContext.SaveChangesAsync();
        }

        public async Task<JitsiLinkDto?> GetClassroomAccessAsync(string email)
        {
            // 1. Validate session existence
            var session = await _applicationDbContext.JitsiSessions
                .FirstOrDefaultAsync(s => s.UserEmail == email);

            if (session == null) return null;

            // 2. Fetch User & Roles
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);
            bool isModerator = roles.Contains("Teacher");

            // 3. Request token generation from Service
            string roomName = "classroom";
            var token = _jwtService.GenerateJitsiToken(user, session.JitsiUserStaticId, isModerator, roomName);

            return new JitsiLinkDto
            {
                Token = token,
                RoomName = roomName,
                AppId = _configuration["Jitsi:AppId"]!,
                DisplayName = user.UserName ?? "User",
                Email = user.Email
            };
        }

        public async Task<bool> IsUserInActiveSessionAsync(string email)
        {
            return await _applicationDbContext.JitsiSessions
                .AnyAsync(s => s.UserEmail == email);
        }
        public async Task<IEnumerable<string>> GetActiveStudentEmailsAsync()
        {
            return await _applicationDbContext.JitsiSessions
                .Where(s => !string.IsNullOrEmpty(s.UserEmail))
                .Select(s => s.UserEmail!)
                .ToListAsync();
        }

        public async Task<bool> CreateGroupAsync(CreateGroupDto dto, string teacherId)
        {
            if (dto.StudentIds.Count > 24) return false;

            var group = new Group
            {
                Name = dto.Name,
                Description = dto.Description,
                TeacherId = teacherId,
                GroupStudents = dto.StudentIds.Select(id => new GroupStudent { StudentId = id }).ToList()
            };

            _applicationDbContext.Groups.Add(group);
            return await _applicationDbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> AddStudentsToGroupAsync(GroupActionDto dto)
        {
            var currentCount = await _applicationDbContext.GroupStudents.CountAsync(gs => gs.GroupId == dto.GroupId);
            if (currentCount + dto.StudentIds.Count > 24) return false;

            foreach (var studentId in dto.StudentIds)
            {
                // Prevent duplicates
                if (!await _applicationDbContext.GroupStudents.AnyAsync(gs => gs.GroupId == dto.GroupId && gs.StudentId == studentId))
                {
                    _applicationDbContext.GroupStudents.Add(new GroupStudent { GroupId = dto.GroupId, StudentId = studentId });
                }
            }
            return await _applicationDbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> RemoveStudentsFromGroupAsync(GroupActionDto dto)
        {
            var entries = _applicationDbContext.GroupStudents
                .Where(gs => gs.GroupId == dto.GroupId && dto.StudentIds.Contains(gs.StudentId));

            _applicationDbContext.GroupStudents.RemoveRange(entries);
            return await _applicationDbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteGroupAsync(int groupId, string teacherId)
        {
            // Find the group and verify the teacher owns it
            var group = await _applicationDbContext.Groups
                .FirstOrDefaultAsync(g => g.Id == groupId && g.TeacherId == teacherId);

            if (group == null)
            {
                return false; // Group not found or teacher doesn't have permission
            }

            _applicationDbContext.Groups.Remove(group);

            return await _applicationDbContext.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Group>> GetTeacherGroupsAsync(string teacherId)
        {
            return await _applicationDbContext.Groups
                .Include(g => g.GroupStudents)
                .Where(g => g.TeacherId == teacherId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<StudentListDto>> GetStudentsByGroupIdAsync(int groupId)
        {
            return await _applicationDbContext.Groups
                .Where(g => g.Id == groupId)
                // Use GroupStudents (the name in your Model) instead of GroupMembers
                .SelectMany(g => g.GroupStudents)
                .Select(gs => new StudentListDto
                {
                    // gs is GroupStudent, we need to reach into the Student (User) object
                    Id = gs.Student.Id,
                    UserName = gs.Student.UserName ?? "Unknown",
                    Email = gs.Student.Email ?? "No Email"
                })
                .ToListAsync();
        }

        public async Task<IdentityResult> UpdateStudentAsync(string id, UpdateStudentDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return IdentityResult.Failed(new IdentityError { Description = "Student not found." });

            user.UserName = dto.UserName; // UserName acts as the primary identifier
            user.Gender = dto.Gender;
            user.NationalId = dto.NationalId;
            user.IdCardNumber = dto.IdCardNumber;

            return await _userManager.UpdateAsync(user);
        }

        public async Task<StudentDetailsDto?> GetStudentByIdAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return null;

            return new StudentDetailsDto
            {
                Id = user.Id,
                UserName = user.UserName!,
                Email = user.Email!, // Ensure this property exists on your Identity User model
                NationalId = user.NationalId,
                IdCardNumber = user.IdCardNumber,
                Gender = user.Gender,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<IdentityResult> DeleteStudentAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Student not found." });
            }

            // This will remove the user from the AspNetUsers table 
            // and automatically handle Role relationships.
            var result = await _userManager.DeleteAsync(user);

            return result;
        }


    }
}
