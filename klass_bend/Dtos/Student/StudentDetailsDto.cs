using klass_bend.Data;

namespace klass_bend.Dtos
{
    public class StudentDetailsDto
    {
        public string Id { get; set; } = default!;
        public string UserName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string NationalId { get; set; } = default!;
        public string? IdCardNumber { get; set; }
        public Gender Gender { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
