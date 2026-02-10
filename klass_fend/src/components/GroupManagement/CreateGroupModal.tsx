import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Search,
  PlusCircle,
  CheckCircle2,
  Settings2,
  XCircle,
  UserPlus,
  X,
} from "lucide-react";
import api from "../../api/axios";
import type { Student } from "../../pages/GroupManagement";

interface Props {
  isOpen: boolean; // Control visibility from parent
  onClose: () => void; // Function to close modal
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

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
      // Wait a bit then close or just reset
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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-brand-deep/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-brand-bg rounded-[3rem] shadow-2xl border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-10 py-6 bg-white border-b border-brand-light/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
              <PlusCircle size={24} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-deep">
                Create New Group
              </h2>
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
                Workspace / Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-muted hover:text-brand-deep"
          >
            <X size={24} />
          </button>
        </div>

        {/* MODAL CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {showSuccess ? (
            <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95">
              <div className="w-24 h-24 bg-brand-teal text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-teal/20">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-brand-deep uppercase">
                  Group Synced
                </h3>
                <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* LEFT: CONFIG */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-brand-light/20 shadow-sm space-y-8">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase text-brand-deep/40 ml-1 mb-2 flex items-center gap-2">
                      Group Name
                    </label>
                    <input
                      className="w-full p-5 bg-brand-bg rounded-2xl border-2 border-transparent focus:border-brand-teal focus:bg-white focus:ring-4 ring-brand-teal/5 transition-all text-sm font-bold text-brand-deep outline-none"
                      placeholder="e.g. Advanced Physics — Section A"
                      value={name}
                      autoFocus
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="p-8 bg-brand-bg/40 rounded-[2rem] border-2 border-dashed border-brand-light/50 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-teal">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                        Selection Count
                      </p>
                      <p className="text-2xl font-black text-brand-deep">
                        {selectedIds.length}{" "}
                        <span className="text-brand-teal text-lg">
                          Students
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={!name.trim() || isSubmitting}
                    className="w-full py-5 bg-brand-deep text-white font-black rounded-2xl shadow-xl hover:bg-brand-teal active:scale-[0.98] transition-all disabled:opacity-20 uppercase text-[10px] tracking-[0.2em]"
                  >
                    {isSubmitting ? "Processing..." : "Create & Initialize"}
                  </button>
                </div>
              </div>

              {/* RIGHT: ROSTER */}
              <div className="bg-white rounded-[2.5rem] border border-brand-light/20 shadow-sm flex flex-col overflow-hidden h-[550px]">
                <div className="p-6 border-b border-brand-bg bg-brand-bg/10">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-deep text-white flex items-center justify-center">
                        <UserPlus size={16} />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-deep">
                        Member Roster
                      </h3>
                    </div>
                    {selectedIds.length > 0 && (
                      <button
                        onClick={() => setSelectedIds([])}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                    />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="w-full pl-9 pr-4 py-3 bg-white border border-brand-light/20 rounded-xl text-xs outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar divide-y divide-brand-bg/50">
                  {filteredStudents.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center px-4 py-3 cursor-pointer transition-all rounded-xl my-1 border ${
                        selectedIds.includes(s.id)
                          ? "bg-brand-teal/5 border-brand-teal/10"
                          : "hover:bg-brand-bg border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-2 border-brand-light/40 text-brand-teal focus:ring-0 cursor-pointer"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                      />
                      <div className="ml-4 text-left">
                        <p className="text-[11px] font-black text-brand-deep uppercase tracking-tight">
                          {s.userName}
                        </p>
                        <p className="text-[9px] text-brand-muted font-bold">
                          {s.email}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
