import { useState, useMemo, useRef, useEffect } from "react";
import {
  UserMinus,
  ChevronDown,
  RotateCcw,
  Trash2,
  Users,
  Filter,
  UserX,
} from "lucide-react";
import api from "../../api/axios";
import type { Student, Group } from "../../pages/GroupManagement";
import StudentListCard from "./StudentListCard";
import { MemberRow } from "./StudentRows";
import DeleteGroupsModal from "./DeleteGroupsModal"; // Import your modal

interface Props {
  students: Student[];
  groups: Group[];
  onUpdate: () => void;
}

const RemoveStudentsTab = ({ students, groups, onUpdate }: Props) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [studentIdsToRemove, setStudentIdsToRemove] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Search states
  const [activeSearch, setActiveSearch] = useState("");
  const [queueSearch, setQueueSearch] = useState("");

  // Modal States
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [showConfirmRemoval, setShowConfirmRemoval] = useState(false);
  const [showSuccessRemoval, setShowSuccessRemoval] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown click-outside logic
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId],
  );

  // Filter: Members currently in the group (not in queue)
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

  // Filter: Removal Queue
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setShowConfirmRemoval(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
      {/* --- GLOBAL DELETE GROUPS MODAL --- */}
      <DeleteGroupsModal
        isOpen={showDeleteGroupModal}
        onClose={() => setShowDeleteGroupModal(false)}
        students={students}
        groups={groups}
        onUpdate={onUpdate}
      />

      {/* --- SELECTOR & ACTIONS BAR --- */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 relative" ref={dropdownRef}>
          <label className="text-[10px] font-black uppercase text-brand-deep/40 ml-4 mb-2 flex items-center gap-2">
            <Filter size={12} /> Target Group
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full bg-white px-6 py-4 rounded-[1.5rem] border transition-all flex items-center justify-between ${
              isDropdownOpen
                ? "border-brand-teal ring-4 ring-brand-teal/5"
                : "border-brand-light/20 shadow-sm"
            }`}
          >
            <span className="text-xs font-black uppercase tracking-widest text-brand-deep">
              {activeGroup
                ? `${activeGroup.name} — ${activeGroup.groupStudents.length} Members`
                : "Select group to manage members..."}
            </span>
            <ChevronDown
              className={`text-brand-muted transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              size={20}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-brand-light/10 overflow-hidden">
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    className="w-full px-6 py-4 text-left hover:bg-brand-bg border-b border-brand-bg last:border-0 transition-colors"
                    onClick={() => {
                      setSelectedGroupId(g.id);
                      setStudentIdsToRemove([]);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="font-black text-xs uppercase text-brand-deep block">
                      {g.name}
                    </span>
                    <span className="text-[9px] text-brand-muted uppercase font-bold">
                      {g.groupStudents.length} Students
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* This button is now ALWAYS enabled and opens the dedicated Modal */}
        <button
          onClick={() => setShowDeleteGroupModal(true)}
          className="h-[58px] px-8 bg-red-50 text-red-600 rounded-[1.5rem] border border-red-100 flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-red-600 hover:text-white shadow-sm"
        >
          <Trash2 size={18} />
          <span>Group Management</span>
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
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
              currentMembers.map((s) => (
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
              ))
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
              <button
                onClick={executeRemoval}
                disabled={studentIdsToRemove.length === 0 || isProcessing}
                className="w-full py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl hover:bg-red-700 transition-all disabled:opacity-20 uppercase text-[10px] tracking-widest"
              >
                {isProcessing
                  ? "Processing..."
                  : `Confirm Removal (${studentIdsToRemove.length})`}
              </button>
            }
          >
            {removalQueue.length > 0 ? (
              removalQueue.map((s) => (
                <div key={s.id} className="relative group">
                  <MemberRow student={s} />
                  <button
                    onClick={() =>
                      setStudentIdsToRemove((prev) =>
                        prev.filter((id) => id !== s.id),
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black text-brand-muted hover:text-brand-deep bg-brand-bg rounded-lg opacity-0 group-hover:opacity-100 transition-all uppercase"
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                </div>
              ))
            ) : (
              <EmptyState icon={<UserX size={32} />} text="Queue is empty" />
            )}
          </StudentListCard>
        </div>
      ) : (
        /* ... Placeholder stays the same ... */
        <div className="w-full py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-brand-light/20 flex flex-col items-center justify-center space-y-4">
          <div className="p-6 bg-brand-bg rounded-full text-brand-muted/30">
            <UserMinus size={48} strokeWidth={1} />
          </div>
          <p className="text-brand-muted font-black uppercase text-[10px] tracking-[0.3em]">
            No Group Selected
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
  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-10">
    {icon}
    <p className="text-[10px] font-black uppercase tracking-widest mt-2">
      {text}
    </p>
  </div>
);

export default RemoveStudentsTab;
