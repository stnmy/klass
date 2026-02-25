import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      setSelectedGroupId("");
      setIsDropdownOpen(false);
      setShowConfirmModal(false);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

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

  const headerTextClasses =
    "text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep/40";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-brand-deep/20 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* MODAL CONTAINER - Adaptive Height */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-brand-bg rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/40 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
        {/* SUCCESS OVERLAY */}
        {showSuccess && (
          <div className="absolute inset-0 z-[160] flex items-center justify-center bg-white/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-brand-teal/10 text-brand-teal rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black text-brand-deep uppercase tracking-[0.2em]">
                  Group Terminated
                </h3>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                  Master registry has been updated.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onClose();
                }}
                className="px-12 py-5 bg-brand-deep text-white font-black rounded-2xl transition-all uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-brand-teal active:scale-95"
              >
                Return to Workspace
              </button>
            </div>
          </div>
        )}

        {/* NESTED CONFIRMATION */}
        {showConfirmModal && (
          <div className="absolute inset-0 z-[150] flex items-center justify-center p-6 bg-brand-deep/10 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-red-100 animate-in zoom-in-95 duration-200">
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto">
                  <AlertTriangle size={36} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-brand-deep uppercase tracking-widest">
                    Confirm Deletion
                  </h3>
                  <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest leading-loose">
                    Permanently dismantle <br />
                    <span className="text-red-500 font-black">
                      "{activeGroup?.name}"
                    </span>
                    ?
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={executeDelete}
                    className="w-full py-5 text-[10px] font-black text-white bg-red-600 rounded-2xl hover:bg-red-700 uppercase tracking-widest transition-all"
                  >
                    Confirm & Purge
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full py-4 text-[9px] font-black text-brand-muted hover:text-brand-deep uppercase tracking-widest transition-all"
                  >
                    Abort Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL HEADER */}
        <div className="p-8 bg-white flex items-center justify-between border-b border-brand-light/10 rounded-t-[3rem] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-deep">
                Terminate Groups
              </h2>
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
                Workspace / Destructive Operations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-brand-bg rounded-full transition-colors text-brand-muted hover:text-brand-deep"
          >
            <X size={24} />
          </button>
        </div>

        {/* MODAL CONTENT - Dynamic height with overflow handling */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div className="relative" ref={dropdownRef}>
            <label className={headerTextClasses + " ml-2 mb-2 block"}>
              Select Target Group
            </label>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full bg-white px-8 py-5 rounded-2xl border transition-all flex items-center justify-between group ${
                isDropdownOpen
                  ? "border-red-500 ring-4 ring-red-500/5 shadow-inner"
                  : "border-brand-light/20 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <ShieldAlert
                  size={18}
                  className={
                    activeGroup ? "text-red-500" : "text-brand-muted/40"
                  }
                />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-deep">
                  {activeGroup
                    ? `${activeGroup.name} — ${activeGroup.groupStudents.length} Active Members`
                    : "Open Group Registry..."}
                </span>
              </div>
              <ChevronDown
                className={`text-brand-muted transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                size={20}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-[200] w-full mt-3 bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-brand-light/10 overflow-hidden animate-in slide-in-from-top-2">
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      className="w-full px-8 py-5 text-left hover:bg-red-50 transition-colors flex justify-between items-center border-b border-brand-bg last:border-0 group"
                      onClick={() => {
                        setSelectedGroupId(g.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="font-black text-[10px] uppercase tracking-widest text-brand-deep group-hover:text-red-600">
                        {g.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-brand-muted uppercase">
                          {g.groupStudents.length} Students
                        </span>
                        <ShieldAlert
                          size={14}
                          className="text-brand-light group-hover:text-red-500"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedGroupId && activeGroup ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* MEMBER PREVIEW */}
              <div className="bg-white/50 rounded-[2.5rem] border border-brand-light/20 shadow-sm flex flex-col overflow-hidden min-h-[350px]">
                <div className="p-6 border-b border-brand-light/10 flex items-center justify-between">
                  <h3 className={headerTextClasses}>Membership Roster</h3>
                  <span className="text-[10px] font-black text-brand-teal">
                    {groupMembers.length} Total
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar max-h-[350px]">
                  {groupMembers.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 flex items-center gap-4 bg-white rounded-2xl border border-brand-light/5 shadow-sm hover:border-brand-teal/20 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-[11px] font-black text-brand-deep border border-brand-light/10">
                        {s.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-brand-deep uppercase tracking-wider">
                          {s.userName}
                        </p>
                        <p className="text-[9px] text-brand-muted font-bold uppercase tracking-tight opacity-60">
                          {s.email}
                        </p>
                      </div>
                    </div>
                  ))}
                  {groupMembers.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                      <UserX size={40} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase mt-4 tracking-widest">
                        Roster Empty
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-5 bg-brand-deep text-white/90 flex items-center justify-center gap-3 shrink-0">
                  <Info size={14} className="text-brand-teal" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-center">
                    Removal only affects the group — student accounts persist
                  </span>
                </div>
              </div>

              {/* ACTION CARD */}
              <div className="bg-white rounded-[2.5rem] border border-red-100 shadow-sm flex flex-col items-center justify-center p-12 text-center space-y-8 border-t-[8px] border-t-red-600 min-h-[350px]">
                <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center shadow-inner group">
                  <Trash2
                    size={40}
                    className="group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.3em]">
                    Dismantle Authorized
                  </h4>
                  <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest leading-relaxed">
                    Once executed, the structure of <br />
                    <span className="text-brand-deep font-black underline decoration-red-200 decoration-2 underline-offset-4">
                      {activeGroup.name}
                    </span>{" "}
                    <br />
                    will be deleted from the cloud.
                  </p>
                </div>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isDeleting}
                  className="w-full py-6 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 active:scale-[0.98] transition-all uppercase text-[10px] tracking-[0.3em]"
                >
                  {isDeleting ? "Processing Purge..." : "Execute Termination"}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-brand-light/20">
              <div className="w-20 h-20 rounded-full border border-brand-light/10 flex items-center justify-center mb-6">
                <ShieldAlert
                  size={48}
                  className="text-brand-muted/10"
                  strokeWidth={1}
                />
              </div>
              <p className="text-brand-muted font-black uppercase text-[10px] tracking-[0.4em] opacity-40">
                Awaiting Target Selection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteGroupsModal;
