namespace klass_bend.Dtos
{
    public class LoginResultDto
    {
        public bool Success { get; set; }
        public string? Token { get; set; }
        public string? Error { get; set; }

        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
