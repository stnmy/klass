using System.ComponentModel.DataAnnotations;

namespace klass_bend.Models
{
    public class JitsiSession
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string JitsiUserStaticId { get; set; }

        [MaxLength(256)]
        public string? UserEmail { get; set; }

        public bool IsOccupied { get; set; }
        public DateTime? JoinedAt { get; set; }
    }
}
