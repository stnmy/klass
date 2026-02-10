using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using klass_bend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace klass_bend.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<JitsiSession> JitsiSessions { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupStudent> GroupStudents { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Enforce Unique Email for Identity
            builder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Jitsi Session Index
            builder.Entity<JitsiSession>()
                .HasIndex(s => s.UserEmail)
                .HasDatabaseName("Index_StudentEmail");

            // NEW: Group Relationships
            builder.Entity<Group>()
                .HasOne(g => g.Teacher)
                .WithMany()
                .HasForeignKey(g => g.TeacherId);

            builder.Entity<GroupStudent>()
                .HasOne(gs => gs.Group)
                .WithMany(g => g.GroupStudents)
                .HasForeignKey(gs => gs.GroupId);

            builder.Entity<GroupStudent>()
                .HasOne(gs => gs.Student)
                .WithMany()
                .HasForeignKey(gs => gs.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<GroupStudent>()
                .HasIndex(gs => new { gs.GroupId, gs.StudentId })
                .IsUnique();

            // Jitsi Seed Data
            for (int i = 1; i <= 25; i++)
            {
                builder.Entity<JitsiSession>().HasData(new JitsiSession
                {
                    Id = i,
                    JitsiUserStaticId = $"student{i:D3}",
                    IsOccupied = false,
                });
            }
        }


    }
}