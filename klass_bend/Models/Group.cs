using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace klass_bend.Models
{
    public class Group
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = default!;

        public string? Description { get; set; }

        [Required]
        public string TeacherId { get; set; } = default!;

        [ForeignKey("TeacherId")]
        public User Teacher { get; set; } = default!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<GroupStudent> GroupStudents { get; set; } = new List<GroupStudent>();
    }
}
