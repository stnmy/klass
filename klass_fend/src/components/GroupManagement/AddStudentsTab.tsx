import { useState, useMemo, useEffect } from "react";
import {
  UserCheck,
  UserPlus,
  FolderPlus,
  Layers,
  Loader2,
  CheckCircle2,
  Search,
} from "lucide-react";
import api from "../../api/axios";
import { type Student, type Group } from "../../pages/GroupManagement";

// Internal Sub-Components
import GroupSelector from "./GroupSelector";
import StudentListCard from "./StudentListCard";
import { MemberRow, CandidateRow } from "./StudentRows";

// Modal Components
import CreateGroupModal from "./CreateGroupModal";

interface Props {
  students: Student[];
  groups: Group[];
  onUpdate: () => void;
}

const AddStudentsTab = ({ students, groups, onUpdate }: Props) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [studentIdsToAdd, setStudentIdsToAdd] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId],
  );

  const filteredExistingMembers = useMemo(() => {
    if (!activeGroup) return [];
    const term = memberSearchTerm.toLowerCase();
    return students.filter((s) => {
      const isMember = activeGroup.groupStudents.some(
        (gs) => gs.studentId === s.id,
      );
      return (
        isMember &&
        (s.userName.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term))
      );
    });
  }, [activeGroup, students, memberSearchTerm]);

  const availableStudents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return students.filter((s) => {
      const isAlreadyMember = activeGroup?.groupStudents.some(
        (gs) => gs.studentId === s.id,
      );
      return (
        !isAlreadyMember &&
        (s.userName.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term))
      );
    });
  }, [activeGroup, students, searchTerm]);

  const handleAdd = async () => {
    if (!selectedGroupId || studentIdsToAdd.length === 0) return;
    setIsSubmitting(true);
    try {
      await api.post(`/user/groups/add-students`, {
        groupId: selectedGroupId,
        studentIds: studentIdsToAdd,
      });
      setShowSuccess(true);
      setStudentIdsToAdd([]);
      setSearchTerm("");
      onUpdate();
    } catch (err) {
      console.error("Add students error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelBase =
    "text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep/40 ml-4 mb-2 flex items-center gap-2";

  const actionButtonBase =
    "h-[64px] flex items-center justify-center gap-3 bg-white border border-brand-light/20 rounded-[1.5rem] shadow-sm hover:border-brand-teal hover:shadow-md active:scale-[0.98] transition-all group shrink-0";

  return (
    /* UI Container: Full width with smooth transitions */
    <div className="w-full pb-6 space-y-6 animate-in fade-in duration-500 relative overflow-visible">
      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed top-28 right-8 z-[100] flex items-center gap-4 bg-white border border-brand-teal/20 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-right-10">
          <div className="w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-deep">
              Sync Complete
            </p>
            <p className="text-[9px] font-bold text-brand-muted uppercase">
              Registry updated
            </p>
          </div>
        </div>
      )}

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        students={students}
        onGroupCreated={onUpdate}
      />

      {/* HEADER CONTROLS: Flex layout for specific width control */}
      <div className="relative z-50 flex flex-col md:flex-row items-end gap-4">
        {/* Left: Target Group Selector (Flexible) */}
        <div className="flex-1 w-full min-w-0">
          <label className={labelBase}>
            <Layers size={12} className="text-brand-teal" /> Target Group
          </label>
          <GroupSelector
            groups={groups}
            activeGroup={activeGroup}
            onSelect={(id) => {
              setSelectedGroupId(id);
              setStudentIdsToAdd([]);
              setMemberSearchTerm("");
            }}
          />
        </div>

        {/* Right: New Group Button (Fixed Width, Matching Height) */}
        <div className="w-full md:w-auto">
          {/* Invisible label to maintain vertical alignment with the selector */}
          <div className="hidden md:block invisible">
            <label className={labelBase}>&nbsp;</label>
          </div>
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className={`${actionButtonBase} w-full md:w-auto px-8`}
          >
            <div className="p-2 rounded-xl bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors">
              <FolderPlus size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep whitespace-nowrap">
              New Group
            </span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10">
        {selectedGroupId ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Active Members Column */}
            <StudentListCard
              title="Active Members"
              count={filteredExistingMembers.length}
              icon={<UserCheck size={16} />}
              searchTerm={memberSearchTerm}
              onSearchChange={setMemberSearchTerm}
            >
              {filteredExistingMembers.length === 0 ? (
                <EmptyListMessage
                  icon={<Search size={32} />}
                  message="Roster empty"
                />
              ) : (
                <div className="space-y-1">
                  {filteredExistingMembers.map((s) => (
                    <MemberRow key={s.id} student={s} />
                  ))}
                </div>
              )}
            </StudentListCard>

            {/* Candidate Addition Column */}
            <StudentListCard
              title="Add Students"
              count={studentIdsToAdd.length}
              countLabel="Queued"
              icon={<UserPlus size={16} />}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              isPrimary
              footer={
                <button
                  onClick={handleAdd}
                  disabled={studentIdsToAdd.length === 0 || isSubmitting}
                  className="w-full py-5 bg-brand-deep text-white font-black rounded-2xl shadow-xl hover:bg-brand-teal active:scale-[0.98] transition-all disabled:opacity-20 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    `Confirm (${studentIdsToAdd.length})`
                  )}
                </button>
              }
            >
              <div className="space-y-1">
                {availableStudents.map((s) => (
                  <CandidateRow
                    key={s.id}
                    student={s}
                    isSelected={studentIdsToAdd.includes(s.id)}
                    onToggle={(id) =>
                      setStudentIdsToAdd((prev) =>
                        prev.includes(id)
                          ? prev.filter((i) => i !== id)
                          : [...prev, id],
                      )
                    }
                  />
                ))}
              </div>
            </StudentListCard>
          </div>
        ) : (
          /* Initial Selection State */
          <div className="w-full py-16 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-brand-light/20 flex flex-col items-center justify-center space-y-4">
            <Layers size={40} className="text-brand-muted/20" />
            <p className="text-brand-muted font-black uppercase text-[10px] tracking-[0.3em]">
              Select a group to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyListMessage = ({
  message,
  icon,
}: {
  message: string;
  icon?: React.ReactNode;
}) => (
  <div className="h-40 flex flex-col items-center justify-center opacity-30 text-center space-y-3">
    {icon}
    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
      {message}
    </p>
  </div>
);

export default AddStudentsTab;
