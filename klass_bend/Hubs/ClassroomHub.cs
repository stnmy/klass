using Microsoft.AspNetCore.SignalR;

namespace klass_bend.Hubs
{
    public class ClassroomHub : Hub
    {
        public async Task SendStateUpdate(object state)
        {
            await Clients.Others.SendAsync("ReceiveStateUpdate", state);
        }
    }
}