namespace klass_bend.Dtos
{
    public class CreateGroupDto
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public List<string> StudentIds { get; set; } = new(); // Can be empty initially
    }
}