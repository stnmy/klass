using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
namespace klass_bend.Infra
{
    public class EmailUserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            // This pulls the email out of the JWT token attached to the connection
            return connection.User?.FindFirst(ClaimTypes.Email)?.Value
                ?? connection.User?.FindFirst("email")?.Value;
        }
    }
}
