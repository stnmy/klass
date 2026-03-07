
namespace klass_bend.Models
{
    public class ClassroomState
    {
        public int Id { get; set; }
        public string? FocusMode { get; set; }
        public bool IsLocked { get; set; }
        public bool IsSynced { get; set; }
    }
}