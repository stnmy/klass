import { useState, useMemo } from "react";
import {
  UserMinus,
  RotateCcw,
  Trash2,
  Users,
  UserX,
  Layers,
} from "lucide-react";
import api from "../../api/axios";
import type { Student, Group } from "../../pages/GroupManagement";

// Internal Sub-Components
import GroupSelector from "./GroupSelector";
import StudentListCard from "./StudentListCard";
import { MemberRow } from "./StudentRows";

// Modal Components
import DeleteGroupsModal from "./DeleteGroupsModal";

interface Props {
  students: Student[];
  groups: Group[];
  onUpdate: () => void;
}

const RemoveStudentsTab = ({ students, groups, onUpdate }: Props) => {
  // Logic States
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [studentIdsToRemove, setStudentIdsToRemove] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Search states
  const [activeSearch, setActiveSearch] = useState("");
  const [queueSearch, setQueueSearch] = useState("");

  // Modal States
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [showSuccessRemoval, setShowSuccessRemoval] = useState(false);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId],
  );

  const currentMembers = useMemo(() => {
    if (!activeGroup) return [];
    return students.filter((s) => {
      const isMember = activeGroup.groupStudents.some(
        (gs) => gs.studentId === s.id,
      );
      const isQueued = studentIdsToRemove.includes(s.id);
      const matchesSearch =
        s.userName.toLowerCase().includes(activeSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(activeSearch.toLowerCase());
      return isMember && !isQueued && matchesSearch;
    });
  }, [activeGroup, students, activeSearch, studentIdsToRemove]);

  const removalQueue = useMemo(() => {
    return students.filter((s) => {
      const isQueued = studentIdsToRemove.includes(s.id);
      const matchesSearch =
        s.userName.toLowerCase().includes(queueSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(queueSearch.toLowerCase());
      return isQueued && matchesSearch;
    });
  }, [students, studentIdsToRemove, queueSearch]);

  const executeRemoval = async () => {
    if (!selectedGroupId || studentIdsToRemove.length === 0) return;
    setIsProcessing(true);
    try {
      await api.post(`/user/groups/remove-students`, {
        groupId: selectedGroupId,
        studentIds: studentIdsToRemove,
      });
      setStudentIdsToRemove([]);
      onUpdate();
      setShowSuccessRemoval(true);
      setTimeout(() => setShowSuccessRemoval(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Standardized UI Classes
  const labelBase =
    "text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep/40 ml-4 mb-2 flex items-center gap-2";

  const actionButtonBase =
    "h-[64px] flex items-center justify-center gap-3 px-8 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-sm";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transform-gpu backface-hidden">
      <DeleteGroupsModal
        isOpen={showDeleteGroupModal}
        onClose={() => setShowDeleteGroupModal(false)}
        students={students}
        groups={groups}
        onUpdate={onUpdate}
      />

      {/* Header Controls Area - Standardized Alignment */}
      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 w-full min-w-0">
          <div className="relative">
            <label className={labelBase}>
              <Layers size={12} /> Target Group
            </label>
            <GroupSelector
              groups={groups}
              activeGroup={activeGroup}
              onSelect={(id) => {
                setSelectedGroupId(id);
                setStudentIdsToRemove([]);
                setActiveSearch("");
                setQueueSearch("");
              }}
            />
          </div>
        </div>

        <button
          onClick={() => setShowDeleteGroupModal(true)}
          className={`${actionButtonBase} bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white shrink-0 group`}
        >
          <div className="p-2 rounded-xl bg-red-500/10 group-hover:bg-white/20 transition-colors">
            <Trash2 size={18} />
          </div>
          <span>Group Management</span>
        </button>
      </div>

      {/* Main Content Grid - Standardized with Add Tab */}
      {selectedGroupId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <StudentListCard
            title="Active Members"
            icon={<Users size={16} />}
            count={currentMembers.length}
            searchTerm={activeSearch}
            onSearchChange={setActiveSearch}
          >
            {currentMembers.length > 0 ? (
              <div className="space-y-1">
                {currentMembers.map((s) => (
                  <div key={s.id} className="relative group">
                    <MemberRow student={s} />
                    <button
                      onClick={() =>
                        setStudentIdsToRemove((prev) => [...prev, s.id])
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Users size={32} />} text="No members found" />
            )}
          </StudentListCard>

          <StudentListCard
            isPrimary
            title="Removal Queue"
            icon={<Trash2 size={16} />}
            count={studentIdsToRemove.length}
            countLabel="To Remove"
            searchTerm={queueSearch}
            onSearchChange={setQueueSearch}
            footer={
              <div className="space-y-3">
                {showSuccessRemoval && (
                  <p className="text-[10px] text-center font-black text-green-500 uppercase tracking-widest animate-bounce">
                    Removal Successful!
                  </p>
                )}
                <button
                  onClick={executeRemoval}
                  disabled={studentIdsToRemove.length === 0 || isProcessing}
                  className="w-full py-5 bg-red-600 text-white font-black rounded-[1.25rem] shadow-xl hover:bg-red-700 transition-all disabled:opacity-20 uppercase text-[10px] tracking-[0.2em]"
                >
                  {isProcessing
                    ? "Processing Queue..."
                    : `Confirm Removal (${studentIdsToRemove.length})`}
                </button>
              </div>
            }
          >
            {removalQueue.length > 0 ? (
              <div className="space-y-1">
                {removalQueue.map((s) => (
                  <div key={s.id} className="relative group">
                    <MemberRow student={s} />
                    <button
                      onClick={() =>
                        setStudentIdsToRemove((prev) =>
                          prev.filter((id) => id !== s.id),
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black text-brand-muted hover:text-brand-deep bg-brand-bg rounded-lg opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest"
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<UserX size={32} />} text="Queue is empty" />
            )}
          </StudentListCard>
        </div>
      ) : (
        <div className="w-full py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-brand-light/10 flex flex-col items-center justify-center space-y-4">
          <div className="p-6 bg-brand-bg rounded-full text-brand-muted/30">
            <UserMinus size={48} strokeWidth={1} />
          </div>
          <p className="text-brand-muted font-black uppercase text-[10px] tracking-[0.3em]">
            Select a group to manage
          </p>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="h-48 flex flex-col items-center justify-center opacity-30 text-center">
    {icon}
    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2">
      {text}
    </p>
  </div>
);

export default RemoveStudentsTab;
