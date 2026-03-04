
using klass_bend.Hubs;
using klass_bend.Interfaces;
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
        [HttpPost("focus")]
        public async Task<IActionResult> SetFocusMode([FromBody] string mode)
        {
            var currentState = await _classRepository.GetClassroomStateAsync();
            if (currentState.IsLocked)
            {
                var success = await _classRepository.UpdateFocusModeAsync(mode);
                if (!success)
                {
                    return BadRequest("Failed to update focus mode");
                }
                await _hubContext.Clients.All.SendAsync("ReceiveFocusUpdate", mode);

                return Ok(new { FocusMode = mode });
            }

            return Ok(new { FocusMode = mode, Synced = false, Message = "Room is not locked; layout not enforced." });
        }

        // [Authorize(Roles = "Teacher")]
        [HttpPost("lock")]
        public async Task<IActionResult> SetLockStatus([FromBody] bool isLocked)
        {

            var success = await _classRepository.UpdateLockStatusAsync(isLocked);
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
            return Ok(new { IsLocked = isLocked });
        }

    }
}