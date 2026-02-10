using klass_bend.Data;
using System.ComponentModel.DataAnnotations;

namespace klass_bend.Dtos
{
    public class CreateStudentDto
    {
        [Required]
        [MaxLength(50)]
        public string UserName { get; set; } = default!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = default!;

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = default!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = default!;

        [Required]
        public Gender Gender { get; set; }

        [Required]
        [MaxLength(20)]
        public string NationalId { get; set; } = default!;

        [MaxLength(20)]
        public string? IdCardNumber { get; set; }
    }
}
