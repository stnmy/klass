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
                    IsLocked = s.IsLocked
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

        public async Task<bool> UpdateLockStatusAsync(bool isLocked)
        {
            var state = await _applicationDbContext.ClassroomState.FirstOrDefaultAsync(x => x.Id == 1);
            if (state == null) return false;

            state.IsLocked = isLocked;
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
            return await _applicationDbContext.SaveChangesAsync() > 0;
        }
    }
}