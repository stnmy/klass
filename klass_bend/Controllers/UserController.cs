using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using klass_bend.Dtos;
using klass_bend.Interfaces;
using klass_bend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace klass_bend.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IClassRepository _classRepository;

        public UserController(IUserRepository userRepository, IClassRepository classRepository)
        {
            _userRepository = userRepository;
            _classRepository = classRepository;
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("CreateStudent")]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userRepository.CreateStudentAsync(dto);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors.Select(e => e.Description));
            }
            return Ok("Student created successfully");
        }

        [Authorize(Roles = "Teacher")]
        [HttpGet("GetAllStudents")]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _userRepository.GetAllStudentsAsync();
            return Ok(students);
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("AssignStudents")]
        public async Task<IActionResult> AssignStudents([FromBody] AddStudentsToSessionDto dto)
        {
            // Get teacher email from JWT claims
            var teacherEmail = User.FindFirstValue(ClaimTypes.Email); // Usually stored in Name or Email claim

            if (string.IsNullOrEmpty(teacherEmail))
                return Unauthorized("Teacher identity not found.");

            if (dto.StudentEmails == null || !dto.StudentEmails.Any())
                return BadRequest("No one to add to meeting");

            // Pass teacherEmail to repository
            var success = await _userRepository.AssignStudentsToJitsiAsync(dto.StudentEmails, teacherEmail);

            if (!success)
                return BadRequest("Failed to add students. Limit of 25 reached.");

            return Ok("Class started. Teacher and students assigned to slots.");
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("ClearSession")]
        public async Task<IActionResult> ClearSession()
        {
            var teacherEmail = User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrEmpty(teacherEmail))
                return Unauthorized();

            await _userRepository.ClearJitsiSessionAsync(teacherEmail);
            await _classRepository.ResetClassroomStateAsync();
            return Ok("Session Cleared. Teacher remains active, other slots available.");
        }

        [Authorize]
        [HttpGet("GetClassroomAccess")]
        public async Task<IActionResult> GetClassroomAccess()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email)) return Unauthorized();

            var result = await _userRepository.GetClassroomAccessAsync(email);

            if (result == null)
                return NoContent(); // 204: No active class assigned to this user

            return Ok(result);
        }

        [Authorize]
        [HttpGet("SessionStatus")]
        public async Task<IActionResult> GetSessionStatus()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email)) return Unauthorized();
            var status = await _userRepository.IsUserInActiveSessionAsync(email);
            return Ok(new { status });

        }

        [Authorize(Roles = "Teacher")]
        [HttpGet("GetActiveStudents")]
        public async Task<IActionResult> GetActiveStudents()
        {
            var activeEmails = await _userRepository.GetActiveStudentEmailsAsync();

            if (activeEmails == null || !activeEmails.Any())
                return Ok(new List<string>()); // Return empty list instead of 404 for cleaner frontend handling

            return Ok(activeEmails);
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("groups/create")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto dto)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null) return Unauthorized();

            var success = await _userRepository.CreateGroupAsync(dto, teacherId);
            return success ? Ok("Group created.") : BadRequest("Failed to create group or student limit exceeded.");
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("groups/add-students")]
        public async Task<IActionResult> AddToGroup([FromBody] GroupActionDto dto)
        {
            var success = await _userRepository.AddStudentsToGroupAsync(dto);
            return success ? Ok("Students added.") : BadRequest("Limit of 24 students reached.");
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("groups/remove-students")]
        public async Task<IActionResult> RemoveFromGroup([FromBody] GroupActionDto dto)
        {
            var success = await _userRepository.RemoveStudentsFromGroupAsync(dto);
            return success ? Ok("Students removed.") : BadRequest("Failed to remove students.");
        }

        [Authorize(Roles = "Teacher")]
        [HttpGet("GetTeacherGroups")]
        public async Task<IActionResult> GetTeacherGroups()
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(teacherId))
            {
                return Unauthorized();
            }

            var groups = await _userRepository.GetTeacherGroupsAsync(teacherId);

            return Ok(groups);
        }

        [Authorize(Roles = "Teacher")]
        [HttpDelete("groups/{groupId}")]
        public async Task<IActionResult> DeleteGroup(int groupId)
        {
            // Extract the Teacher ID from the current authenticated user's claims
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(teacherId))
            {
                return Unauthorized(new { message = "User not identified." });
            }

            var result = await _userRepository.DeleteGroupAsync(groupId, teacherId);

            if (!result)
            {
                return NotFound(new { message = "Group not found or you do not have permission to delete it." });
            }

            return Ok(new { message = "Group successfully deleted." });
        }

        [HttpGet("GetGroupMembers/{groupId}")]
        public async Task<ActionResult<IEnumerable<StudentListDto>>> GetGroupMembers(int groupId)
        {
            // Fix: Check if ID is valid (int cannot be converted to bool)
            if (groupId <= 0)
            {
                return BadRequest("A valid Group ID is required.");
            }

            try
            {
                // This will now match the interface and repository
                var students = await _userRepository.GetStudentsByGroupIdAsync(groupId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                // Log ex
                return StatusCode(500, "An error occurred while fetching group members.");
            }
        }


        [Authorize(Roles = "Teacher")]
        [HttpPut("UpdateStudent/{id}")]
        public async Task<IActionResult> UpdateStudent(string id, [FromBody] UpdateStudentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userRepository.UpdateStudentAsync(id, dto);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors.Select(e => e.Description));
            }

            return Ok("Student updated successfully");
        }

        [Authorize(Roles = "Teacher")]
        [HttpGet("GetStudent/{id}")]
        public async Task<IActionResult> GetStudent(string id)
        {
            var student = await _userRepository.GetStudentByIdAsync(id);

            if (student == null)
            {
                return NotFound("Student not found");
            }

            return Ok(student);
        }

        [Authorize(Roles = "Teacher")]
        [HttpDelete("DeleteStudent/{id}")]
        public async Task<IActionResult> DeleteStudent(string id)
        {
            var result = await _userRepository.DeleteStudentAsync(id);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors.Select(e => e.Description));
            }

            return Ok(new { message = "Student deleted successfully" });
        }

    }
}