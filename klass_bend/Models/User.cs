using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using klass_bend.Data;
using Microsoft.AspNetCore.Identity;

namespace klass_bend.Models
{
    public class User : IdentityUser
    {

        [Required]
        public Gender Gender { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(20)]
        public string NationalId { get; set; } = default!;

        [MaxLength(20)]
        public string? IdCardNumber { get; set; }

    }
}