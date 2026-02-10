namespace klass_bend.Dtos
{
    public class GroupActionDto
    {
        public int GroupId { get; set; }
        public List<string> StudentIds { get; set; } = new();
    }
}
