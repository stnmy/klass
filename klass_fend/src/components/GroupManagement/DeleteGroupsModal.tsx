import { useState, useMemo, useRef, useEffect } from "react";
import {
  Trash2,
  ChevronDown,
  AlertTriangle,
  ShieldAlert,
  Info,
  X,
  UserX,
  CheckCircle2,
} from "lucide-react";
import api from "../../api/axios";
import type { Student, Group } from "../../pages/GroupManagement";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  groups: Group[];
  onUpdate: () => void;
}

const DeleteGroupsModal = ({
  isOpen,
  onClose,
  students,
  groups,
  onUpdate,
}: Props) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedGroupId("");
      setIsDropdownOpen(false);
      setShowConfirmModal(false);
    }
  }, [isOpen]);

  // Click outside dropdown logic
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

  const groupMembers = useMemo(() => {
    if (!activeGroup) return [];
    return students.filter((s) =>
      activeGroup.groupStudents.some((gs) => gs.studentId === s.id),
    );
  }, [activeGroup, students]);

  const executeDelete = async () => {
    if (!selectedGroupId || !activeGroup) return;
    setIsDeleting(true);
    setShowConfirmModal(false);

    try {
      await api.delete(`/user/groups/${selectedGroupId}`);
      onUpdate();
      setShowSuccess(true);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const headerTextClasses = "text-[10px] font-black uppercase tracking-[0.2em]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-brand-deep/60 backdrop-blur-xl animate-in fade-in duration-300">
      {/* INTERNAL SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-white/95 backdrop-blur-md rounded-[2.5rem] animate-in zoom-in-95">
          <div className="text-center space-y-6 p-8">
            <div className="w-20 h-20 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-black text-brand-deep uppercase tracking-tight">
              Group Terminated
            </h3>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="px-12 py-4 bg-brand-deep text-white font-black rounded-2xl transition-all uppercase text-[10px] tracking-widest shadow-xl hover:bg-brand-teal"
            >
              Finish
            </button>
          </div>
        </div>
      )}

      {/* NESTED CONFIRMATION (Higher Z-Index) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-red-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-red-100">
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-brand-deep uppercase">
                  Irreversible Action
                </h3>
                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wide">
                  Confirm deletion of{" "}
                  <span className="text-red-600 font-black">
                    "{activeGroup?.name}"
                  </span>
                  ?
                </p>
              </div>
            </div>
            <div className="flex border-t border-brand-bg">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-5 text-[10px] font-black text-brand-muted hover:bg-brand-bg uppercase tracking-widest"
              >
                Go Back
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-5 text-[10px] font-black text-white bg-red-600 hover:bg-red-700 uppercase tracking-widest"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-brand-bg w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative border border-white/20">
        {/* MODAL HEADER */}
        <div className="p-6 bg-white flex items-center justify-between border-b border-brand-light/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-[1.25rem] flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-deep uppercase tracking-tight">
                Delete Groups
              </h2>
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                Remove group definitions permanently
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-brand-bg rounded-full transition-colors text-brand-muted hover:text-brand-deep"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {/* GROUP DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full bg-white px-6 py-5 rounded-[1.5rem] border transition-all flex items-center justify-between group ${
                isDropdownOpen
                  ? "border-red-500 ring-4 ring-red-500/5"
                  : "border-brand-light/20 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert
                  size={16}
                  className={activeGroup ? "text-red-500" : "text-brand-muted"}
                />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-deep">
                  {activeGroup
                    ? `${activeGroup.name} — ${activeGroup.groupStudents.length} Members`
                    : "Select group to delete..."}
                </span>
              </div>
              <ChevronDown
                className={`text-brand-muted transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                size={20}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-brand-light/10 overflow-hidden animate-in slide-in-from-top-2">
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      className="w-full px-6 py-4 text-left hover:bg-red-50 transition-colors flex justify-between items-center border-b border-brand-bg last:border-0 group"
                      onClick={() => {
                        setSelectedGroupId(g.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="font-black text-xs uppercase tracking-wider text-brand-deep group-hover:text-red-600">
                        {g.name}
                      </span>
                      <ShieldAlert
                        size={14}
                        className="text-red-100 group-hover:text-red-500"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedGroupId && activeGroup ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[450px]">
              {/* MEMBER PREVIEW */}
              <div className="bg-white rounded-[2rem] border border-brand-light/20 shadow-sm flex flex-col overflow-hidden">
                <div className="p-5 border-b border-brand-bg bg-brand-bg/10">
                  <h3 className={headerTextClasses}>Membership Preview</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {groupMembers.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 flex items-center gap-4 bg-brand-bg/20 rounded-2xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-brand-muted">
                        {s.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-brand-deep uppercase">
                          {s.userName}
                        </p>
                        <p className="text-[9px] text-brand-muted font-bold">
                          {s.email}
                        </p>
                      </div>
                    </div>
                  ))}
                  {groupMembers.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                      <UserX size={32} />
                      <p className="text-[10px] font-black uppercase mt-2">
                        Empty Group
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-brand-bg/50 flex items-center justify-center gap-2">
                  <Info size={12} className="text-brand-muted" />
                  <span className="text-[8px] font-bold text-brand-muted uppercase tracking-wider italic">
                    Students won't be deleted
                  </span>
                </div>
              </div>

              {/* ACTION CARD */}
              <div className="bg-white rounded-[2rem] border border-red-100 shadow-sm flex flex-col items-center justify-center p-8 text-center space-y-6 border-t-[6px] border-t-red-600">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center shadow-inner group">
                  <Trash2
                    size={36}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-red-600 uppercase tracking-widest">
                    Authorize Deletion
                  </h4>
                  <p className="text-[10px] text-brand-muted font-bold uppercase leading-relaxed">
                    This will permanently dismantle the group <br />
                    <span className="text-brand-deep underline decoration-red-200 decoration-2">
                      {activeGroup.name}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isDeleting}
                  className="w-full py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all uppercase text-[10px] tracking-[0.2em]"
                >
                  {isDeleting ? "Deleting..." : "Delete Group"}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[450px] flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-brand-light/10">
              <ShieldAlert
                size={48}
                className="text-brand-muted/20 mb-4"
                strokeWidth={1}
              />
              <p className="text-brand-muted font-black uppercase text-[10px] tracking-[0.3em]">
                Select target for termination
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteGroupsModal;
