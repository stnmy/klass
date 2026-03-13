namespace klass_bend.Dtos
{
    public class AddStudentsToSessionDto
    {
        public List<String> StudentEmails { get; set; } = new List<string>();
        public List<String> UserNames { get; set; } = new List<string>();
    }
}
