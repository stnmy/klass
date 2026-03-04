using klass_bend.Data;
using System.ComponentModel.DataAnnotations;

public class UpdateStudentDto
{
    [Required]
    [MaxLength(50)]
    public string UserName { get; set; } = default!;

    [Required]
    public Gender Gender { get; set; }

    [Required]
    [MaxLength(20)]
    public string NationalId { get; set; } = default!;

    [MaxLength(20)]
    public string? IdCardNumber { get; set; }
}