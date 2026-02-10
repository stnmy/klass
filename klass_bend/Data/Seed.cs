using klass_bend.Models;
using Microsoft.AspNetCore.Identity;

namespace klass_bend.Data
{
    public static class Seed
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();

            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

            string[] roles = new[] { "Student", "Teacher" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            var teacherEmail = "teacher@gmail.com";
            var teacher = await userManager.FindByEmailAsync(teacherEmail);
            if (teacher == null)
            {
                teacher = new User
                {
                    UserName = "teacher",
                    Email = teacherEmail,
                    EmailConfirmed = true,
                    Gender = Gender.Male,
                    NationalId = "123",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(teacher, "Teacher@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(teacher, "Teacher");
                }
            }

            var studentEmail = "student@gmail.com";
            var student = await userManager.FindByEmailAsync(studentEmail);
            if (student == null)
            {
                student = new User
                {
                    UserName = "student",
                    Email = studentEmail,
                    EmailConfirmed = true,
                    Gender = Gender.Male,
                    NationalId = "456",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(student, "Student@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(student, "Student");
                }
            }
        }
    }
}

