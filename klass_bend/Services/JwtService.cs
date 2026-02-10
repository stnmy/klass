using klass_bend.Interfaces;
using klass_bend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace klass_bend.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly byte[] _key;

        public JwtService(IConfiguration configuration, UserManager<User> userManager)
        {
            _configuration = configuration;
            _userManager = userManager;
            var keyFromConfig = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(keyFromConfig))
                throw new ArgumentNullException("Jwt:Key", "JWT Key is missing in configuration.");

            _key = Encoding.UTF8.GetBytes(keyFromConfig);
        }
        public async Task<string> GenerateTokenAsync(User user)
        {
            var jwt = _configuration.GetSection("Jwt");

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName!),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!)
            };

            // ❌ DON'T use .Result (can cause deadlocks)
            var userRoles = await _userManager.GetRolesAsync(user);

            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["Key"]!)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    double.Parse(jwt["DurationInMinutes"]!)
                ),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        public ClaimsPrincipal? ValidateToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(_key),
                ClockSkew = TimeSpan.Zero // optional, reduces time window for expiration
            };

            try
            {
                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
                return principal;
            }
            catch
            {
                return null; // invalid token
            }
        }

        public string GenerateJitsiToken(User user, string staticId, bool isModerator, string roomName)
        {
            var jitsi = _configuration.GetSection("Jitsi");
            var pemKey = jitsi["PrivateKey"];

            // 1. Import the key into a temporary RSA instance
            using var rsaTemp = RSA.Create();
            rsaTemp.ImportFromPem(pemKey.Replace("\\n", "\n"));

            // 2. Export the parameters (this copies the actual key data)
            var rsaParameters = rsaTemp.ExportParameters(true);

            // 3. Create the security key using the parameters, NOT the disposable object
            var securityKey = new RsaSecurityKey(rsaParameters);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.RsaSha256);

            var header = new JwtHeader(credentials);
            header["kid"] = jitsi["KeyId"];

            var context = new Dictionary<string, object>
            {
                { "user", new Dictionary<string, object>
                    {
                        { "id", staticId },
                        { "name", user.UserName ?? "Guest" },
                        { "email", user.Email ?? "" },
                        { "moderator", isModerator }
                    }
                },
                { "features", new Dictionary<string, object>
                    {
                        { "recording", true },
                        { "livestreaming", true },
                        { "transcription", true }
                    }
                }
            };

                    var payload = new JwtPayload
            {
                { "aud", "jitsi" },
                { "iss", "chat" },
                { "sub", jitsi["AppId"] },
                { "room", roomName },
                { "iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
                { "exp", DateTimeOffset.UtcNow.AddHours(2).ToUnixTimeSeconds() },
                { "nbf", DateTimeOffset.UtcNow.AddSeconds(-10).ToUnixTimeSeconds() },
                { "context", context }
            };

            var token = new JwtSecurityToken(header, payload);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
