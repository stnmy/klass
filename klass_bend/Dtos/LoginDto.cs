using System.ComponentModel.DataAnnotations;

namespace klass_bend.Dtos
{
    public class LoginDto
    {
        [Required]
        public string UserName { get; set; } = default!;

        [Required]
        public string Password { get; set; } = default!;
    }
}
