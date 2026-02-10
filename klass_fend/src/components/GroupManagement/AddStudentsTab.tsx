import { useState, useMemo } from "react";
import { UserCheck, UserPlus, FolderPlus } from "lucide-react";
import api from "../../api/axios";
import { type Student, type Group } from "../../pages/GroupManagement";

// Internal Sub-Components
import GroupSelector from "./GroupSelector";
import StudentListCard from "./StudentListCard";
import SuccessModal from "./SuccessModal";
import EmptyState from "./EmptyState";
import { MemberRow, CandidateRow } from "./StudentRows";

// Modal Components
import CreateGroupModal from "./CreateGroupModal";

interface Props {
  students: Student[];
  groups: Group[];
  onUpdate: () => void;
}

const AddStudentsTab = ({ students, groups, onUpdate }: Props) => {
  // Logic States
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [studentIdsToAdd, setStudentIdsToAdd] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Modal Toggle State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

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

  // Consistent Button Styles
  const actionButtonClasses =
    "flex items-center justify-center gap-3 px-8 py-4 bg-white border border-brand-light/20 rounded-[1.25rem] shadow-sm hover:border-brand-teal hover:shadow-md active:scale-[0.98] transition-all group shrink-0";

  const iconBoxClasses = "p-1.5 rounded-lg transition-colors";

  const buttonTextClasses =
    "text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep whitespace-nowrap";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Modals */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        students={students}
        onGroupCreated={onUpdate}
      />

      {/* Header Controls Area */}
      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 w-full min-w-0">
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

        {/* Create Group Action Only */}
        <button
          onClick={() => setIsGroupModalOpen(true)}
          className={actionButtonClasses}
        >
          <div
            className={`${iconBoxClasses} bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white`}
          >
            <FolderPlus size={16} />
          </div>
          <span className={buttonTextClasses}>New Group</span>
        </button>
      </div>

      {/* Main Content Grid */}
      {selectedGroupId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <StudentListCard
            title="In Group"
            count={filteredExistingMembers.length}
            icon={<UserCheck size={14} />}
            searchTerm={memberSearchTerm}
            onSearchChange={setMemberSearchTerm}
          >
            {filteredExistingMembers.length === 0 ? (
              <EmptyListMessage message="No members found" />
            ) : (
              filteredExistingMembers.map((s) => (
                <MemberRow key={s.id} student={s} />
              ))
            )}
          </StudentListCard>

          <StudentListCard
            title="Add Students"
            count={studentIdsToAdd.length}
            countLabel="Queued"
            icon={<UserPlus size={14} />}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isPrimary
            footer={
              <button
                onClick={handleAdd}
                disabled={studentIdsToAdd.length === 0 || isSubmitting}
                className="w-full py-4 bg-brand-deep text-white font-black rounded-2xl shadow-xl hover:bg-brand-teal active:scale-[0.98] transition-all disabled:opacity-30 uppercase text-[10px] tracking-[0.2em]"
              >
                {isSubmitting
                  ? "Syncing..."
                  : `Confirm Add (${studentIdsToAdd.length})`}
              </button>
            }
          >
            {availableStudents.length === 0 ? (
              <EmptyListMessage message="No candidates available" />
            ) : (
              availableStudents.map((s) => (
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
              ))
            )}
          </StudentListCard>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

const EmptyListMessage = ({ message }: { message: string }) => (
  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-10">
    <p className="text-[9px] font-black uppercase tracking-[0.2em]">
      {message}
    </p>
  </div>
);

export default AddStudentsTab;
