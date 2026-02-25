import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Search,
  CheckCircle2,
  X,
  FolderPlus,
  Loader2,
} from "lucide-react";
import api from "../../api/axios";
import type { Student } from "../../pages/GroupManagement";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onGroupCreated: () => void;
}

const CreateGroupModal = ({
  isOpen,
  onClose,
  students,
  onGroupCreated,
}: Props) => {
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.userName?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term),
    );
  }, [students, searchTerm]);

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post("/user/groups/create", {
        name,
        studentIds: selectedIds,
        description: "",
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setName("");
        setSelectedIds([]);
        onGroupCreated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Render via Portal to ensure the backdrop and blur cover the whole screen
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* BACKDROP - Synced with CreateStudentModal */}
      <div
        className="absolute inset-0 bg-brand-deep/20 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* MODAL CONTAINER - Synced Design System */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-brand-bg rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/40 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-brand-light/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
              <FolderPlus size={22} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-deep">
                Initialize Group
              </h2>
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
                Workspace / Record Creation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-muted"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {showSuccess ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-brand-teal text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-teal/20">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-brand-deep uppercase tracking-tighter">
                  Registry Created
                </h3>
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em]">
                  Database sync successful
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-8">
              {/* Group Name Input */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep/40 ml-1 mb-2 flex items-center gap-2">
                  Group Identity
                </label>
                <input
                  className="w-full p-5 bg-white rounded-2xl border border-brand-light/20 focus:border-brand-teal focus:ring-4 ring-brand-teal/5 transition-all text-sm font-bold text-brand-deep outline-none placeholder:text-brand-muted/30"
                  placeholder="ENTER GROUP TITLE..."
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Roster Selection Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep/40 flex items-center gap-2">
                    Student Roster ({selectedIds.length})
                  </label>
                  <div className="relative w-48">
                    <Search
                      size={12}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                    />
                    <input
                      type="text"
                      placeholder="FILTER..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-brand-light/20 rounded-lg text-[9px] font-bold uppercase tracking-widest outline-none focus:border-brand-teal"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-white border border-brand-light/10 rounded-2xl max-h-60 overflow-y-auto custom-scrollbar p-2">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <label
                        key={s.id}
                        className={`flex items-center px-4 py-3 cursor-pointer transition-all rounded-xl my-0.5 border ${
                          selectedIds.includes(s.id)
                            ? "bg-brand-teal/5 border-brand-teal/10"
                            : "hover:bg-brand-bg border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-2 border-brand-light/40 text-brand-teal focus:ring-0 cursor-pointer"
                          checked={selectedIds.includes(s.id)}
                          onChange={() => toggleStudent(s.id)}
                        />
                        <div className="ml-4 flex-1">
                          <p className="text-[10px] font-black text-brand-deep uppercase">
                            {s.userName}
                          </p>
                          <p className="text-[8px] text-brand-muted font-bold uppercase tracking-tight">
                            {s.email}
                          </p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="py-10 flex flex-col items-center justify-center opacity-20 text-center">
                      <Users size={24} />
                      <p className="text-[9px] font-black uppercase tracking-widest mt-2">
                        No Candidates Found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {!showSuccess && (
          <div className="p-8 bg-white border-t border-brand-light/10 shrink-0">
            <button
              onClick={handleSave}
              disabled={!name.trim() || isSubmitting}
              className="w-full py-5 bg-brand-deep text-white font-black rounded-2xl shadow-xl hover:bg-brand-teal active:scale-[0.98] transition-all disabled:opacity-20 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {isSubmitting ? "Syncing..." : "Finalize Group Creation"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default CreateGroupModal;
