using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace klass_bend.Dtos.Classroom
{
    public class SyncLayoutRequest
    {
        public string? FocusMode { get; set; }
        public bool IsLocked { get; set; }
        public bool IsSynced { get; set; }
    }
}