using klass_bend.Data;
using klass_bend.Dtos.ClassRoom;
using klass_bend.Interfaces;
using klass_bend.Models;
using Microsoft.EntityFrameworkCore;

namespace klass_bend.Services
{
    public class ClassRepository : IClassRepository
    {
        private readonly ApplicationDbContext _applicationDbContext;

        public ClassRepository(ApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task<ClassroomStateDto> GetClassroomStateAsync()
        {
            return (await _applicationDbContext.ClassroomState
                .Where(s => s.Id == 1)
                .Select(s => new ClassroomStateDto
                {
                    FocusMode = s.FocusMode,
                    IsLocked = s.IsLocked,
                    IsSynced = s.IsSynced
                })
            .FirstOrDefaultAsync())!;
        }

        public async Task<bool> UpdateFocusModeAsync(string mode)
        {
            var state = await _applicationDbContext.ClassroomState.FirstOrDefaultAsync(x => x.Id == 1);
            if (state == null) return false;

            state.FocusMode = mode;
            return await _applicationDbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateLockStatusAsync(bool isLocked, bool isSynced)
        {
            // Assuming ID 1 is the singleton state
            var state = await _applicationDbContext.ClassroomState.FirstOrDefaultAsync(x => x.Id == 1);

            if (state == null) return false;

            state.IsLocked = isLocked;
            state.IsSynced = isSynced;

            return await _applicationDbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateClassroomLayoutAsync(string mode, bool isLocked, bool isSynced)
        {
            var state = await _applicationDbContext.ClassroomState.FirstOrDefaultAsync(x => x.Id == 1);
            if (state == null) return false;

            state.FocusMode = mode;
            state.IsLocked = isLocked;
            state.IsSynced = isSynced;
            return await _applicationDbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> ResetClassroomStateAsync()
        {
            var state = await _applicationDbContext.ClassroomState.FirstOrDefaultAsync(x => x.Id == 1);
            if (state == null)
            {
                return false;
            }

            state.FocusMode = "default";
            state.IsLocked = false;
            state.IsSynced = false;
            return await _applicationDbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateStudentHandStatusByEmailAsync(string email, bool isRaised)
        {
            var session = await _applicationDbContext.JitsiSessions
                .FirstOrDefaultAsync(s => s.UserEmail == email);

            if (session == null) return false;

            session.IsHandRaised = isRaised;
            return await _applicationDbContext.SaveChangesAsync() > 0;
        }
        public async Task<string?> LowerStudentHandAsync(string displayName)
        {
            // Find the session matching the name that is currently occupied
            var session = await _applicationDbContext.JitsiSessions
                .FirstOrDefaultAsync(s => s.IsOccupied && s.DisplayName == displayName);

            if (session == null) return null;

            session.IsHandRaised = false;
            await _applicationDbContext.SaveChangesAsync();

            // Return the email so the controller knows who to notify via SignalR
            return session.UserEmail;
        }
    }
}