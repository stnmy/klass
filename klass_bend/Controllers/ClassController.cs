
using klass_bend.Dtos.Classroom;
using klass_bend.Hubs;
using klass_bend.Interfaces;
using klass_bend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace klass_bend.Controllers
{
    [Route("api/class")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly IClassRepository _classRepository;
        private readonly IHubContext<ClassroomHub> _hubContext;

        public ClassController(IClassRepository classRepository, IHubContext<ClassroomHub> hubContext)
        {
            _classRepository = classRepository;
            _hubContext = hubContext;
        }

        [HttpGet("state")]
        public async Task<IActionResult> GetState()
        {
            try
            {
                var state = await _classRepository.GetClassroomStateAsync();

                if (state == null)
                {
                    return NotFound(new { error = "No classroom state found. Ensure a row with ID 1 exists in the database." });
                }

                return Ok(state);
            }
            catch (Exception ex)
            {
                // This will return the specific SQL or System error to your browser/Postman
                return StatusCode(500, new
                {
                    message = "Internal Server Error",
                    details = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
        // [Authorize(Roles = "Teacher")]
        //[HttpPost("focus")]
        //public async Task<IActionResult> SetFocusMode([FromBody] string mode)
        //{
        //    var currentState = await _classRepository.GetClassroomStateAsync();
        //    if (currentState.IsLocked)
        //    {
        //        var success = await _classRepository.UpdateFocusModeAsync(mode);
        //        if (!success)
        //        {
        //            return BadRequest("Failed to update focus mode");
        //        }
        //        await _hubContext.Clients.All.SendAsync("ReceiveFocusUpdate", mode);

        //        return Ok(new { FocusMode = mode });
        //    }

        //    return Ok(new { FocusMode = mode, Synced = false, Message = "Room is not locked; layout not enforced." });
        //}

        // [Authorize(Roles = "Teacher")]
        [HttpPost("lock")]
        public async Task<IActionResult> SetLockStatus([FromBody] LockUpdateRequest lockUpdateRequest)
        {

            var success = await _classRepository.UpdateLockStatusAsync(lockUpdateRequest.IsLocked, lockUpdateRequest.IsSynced);
            if (!success)
            {
                return BadRequest("Failed to update lock status.");
            }
            var newState = await _classRepository.GetClassroomStateAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveLockUpdate", new
            {
                isLocked = newState.IsLocked,
                focusMode = newState.FocusMode
            });
            return Ok(new { lockUpdateRequest });
        }

        [Authorize]
        [HttpPost("update-hand-state")]
        public async Task<IActionResult> UpdateHandState([FromBody] HandStateRequest request)
        {
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                         ?? User.FindFirst("email")?.Value;

            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Email claim not found in token.");
            }

            // Access the boolean via request.IsRaised
            var result = await _classRepository.UpdateStudentHandStatusByEmailAsync(userEmail, request.IsRaised);

            if (!result)
            {
                return NotFound("Jitsi session not found for this user.");
            }

            return Ok();
        }

        [HttpPost("sync-layout")]
        public async Task<IActionResult> SyncLayout([FromBody] SyncLayoutRequest request)
        {
            // Call the new combined method
            var success = await _classRepository.UpdateClassroomLayoutAsync(
                request.FocusMode,
                request.IsLocked,
                request.IsSynced
            );

            if (!success)
            {
                return BadRequest("Failed to sync classroom layout.");
            }

            // Broadcast the new state
            await _hubContext.Clients.All.SendAsync("ReceiveLockUpdate", new
            {
                focusMode = request.FocusMode,
                isLocked = request.IsLocked,
                //isSynced = request.IsSynced
            });

            return Ok(new { message = "Layout synced successfully", state = request });
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("teacher-lower-hand")]
        public async Task<IActionResult> TeacherLowerHand([FromBody] LowerHandRequest request)
        {
            if (string.IsNullOrEmpty(request.DisplayName))
            {
                return BadRequest("DisplayName is required.");
            }

            // 1. Update DB and get the student's email
            var studentEmail = await _classRepository.LowerStudentHandAsync(request.DisplayName);

            if (string.IsNullOrEmpty(studentEmail))
            {
                return NotFound("Active student session not found.");
            }

            // 2. Notify ONLY that specific student via SignalR
            // Using .User(email) works because of the EmailUserIdProvider we registered
            await _hubContext.Clients.User(studentEmail).SendAsync("ReceiveHandLowered");

            // 3. Optional: Notify everyone to refresh their UI roster (if you want real-time updates for all)
            await _hubContext.Clients.All.SendAsync("UpdateRoster");

            return Ok(new { message = "Hand lowered and student notified." });
        }
    }
}