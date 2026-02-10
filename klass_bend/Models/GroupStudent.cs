using System.ComponentModel.DataAnnotations;

namespace klass_bend.Models
{
    public class GroupStudent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int GroupId { get; set; }
        public Group Group { get; set; } = default!;

        [Required]
        public string StudentId { get; set; } = default!;
        public User Student { get; set; } = default!;

    }
}
