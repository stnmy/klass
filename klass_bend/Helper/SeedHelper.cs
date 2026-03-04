using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using klass_bend.Data;
using klass_bend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace klass_bend.Helper
{
    public static class SeedHelper
    {
        public static async Task EnsureDataIsSeeded(IServiceProvider services, ApplicationDbContext db, ILogger logger)
        {
            var userManager = services.GetRequiredService<UserManager<User>>();

            // 1. Seed Users and Roles first
            if (!await userManager.Users.AnyAsync())
            {
                await Seed.SeedAsync(services);
            }

            // 2. Classroom State
            if (!await db.ClassroomState.AnyAsync(s => s.Id == 1))
            {
                db.ClassroomState.Add(new ClassroomState { Id = 1, FocusMode = "default", IsLocked = false });
                await db.SaveChangesAsync();
            }

            // 3. Update the existing JitsiSession row
            // We fetch the first record (ordered by Id or just the first available)
            var firstJitsiSession = await db.JitsiSessions.FirstOrDefaultAsync();

            if (firstJitsiSession != null)
            {
                logger.LogInformation("Updating first JitsiSession row with teacher email...");

                // Only update if it's not already set to avoid unnecessary DB writes
                if (firstJitsiSession.UserEmail != "teacher@gmail.com")
                {
                    firstJitsiSession.UserEmail = "teacher@gmail.com";
                    await db.SaveChangesAsync();
                }
            }
            else
            {
                // Optional: If for some reason the table is totally empty, 
                // you might still want to create that first row.
                db.JitsiSessions.Add(new JitsiSession { UserEmail = "teacher@gmail.com" });
                await db.SaveChangesAsync();
            }
        }
    }
}