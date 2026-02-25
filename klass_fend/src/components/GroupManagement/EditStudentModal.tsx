import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, User, Hash, Users, ChevronDown } from "lucide-react";
import api from "../../api/axios";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
  onStudentUpdated: () => void;
}

const EditStudentModal = ({
  isOpen,
  onClose,
  studentId,
  onStudentUpdated,
}: EditStudentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    userName: "",
    nationalId: "",
    idCardNumber: "",
    gender: 0,
  });

  const genderOptions = [
    { value: 1, label: "Male" },
    { value: 2, label: "Female" },
    { value: 3, label: "Other" },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      if (studentId) fetchStudentDetails();
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, studentId, onClose]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsGenderOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/user/GetStudent/${studentId}`);
      setFormData({
        userName: res.data.userName,
        nationalId: res.data.nationalId,
        idCardNumber: res.data.idCardNumber || "",
        gender: res.data.gender,
      });
    } catch (err) {
      console.error("Error fetching student", err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/user/UpdateStudent/${studentId}`, formData);
      onStudentUpdated();
      onClose();
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputBase =
    "w-full pl-12 pr-6 py-4 rounded-2xl bg-brand-bg/50 border border-brand-light/20 text-brand-deep focus:outline-none focus:border-brand-teal focus:bg-white transition-all text-sm font-bold placeholder:text-brand-muted/40";
  const labelBase =
    "text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep/40 ml-1 mb-2 flex items-center gap-2";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-brand-deep/20 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* MODAL CONTAINER - Height is now dynamic (max-h for safety) */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-brand-bg rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/40 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-10 py-8 bg-white border-b border-brand-light/10 rounded-t-[3rem] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-lg shadow-brand-teal/20">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-deep">
                Edit Student Profile
              </h2>
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
                Workspace / Update Identity
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

        {/* CONTENT - Overflow-y handles cases where content exceeds screen height */}
        <div className="overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-6 opacity-40">
              <div className="relative">
                <Loader2
                  className="animate-spin text-brand-deep"
                  size={48}
                  strokeWidth={1}
                />
                <div className="absolute inset-0 blur-xl bg-brand-teal/20 animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                Retrieving Profile
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="flex flex-col">
                <label className={labelBase}>Username</label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                  />
                  <input
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    required
                    className={inputBase}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="flex flex-col" ref={dropdownRef}>
                <label className={labelBase}>Gender Identity</label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                  />
                  <button
                    type="button"
                    onClick={() => setIsGenderOpen(!isGenderOpen)}
                    className={`${inputBase} text-left flex items-center justify-between uppercase tracking-wider ${isGenderOpen ? "border-brand-teal ring-4 ring-brand-teal/5" : ""}`}
                  >
                    <span>
                      {genderOptions.find((o) => o.value === formData.gender)
                        ?.label || "Select Gender"}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${isGenderOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isGenderOpen && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-brand-light/20 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-[150] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      {genderOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, gender: option.value });
                            setIsGenderOpen(false);
                          }}
                          className="w-full px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-brand-deep hover:bg-brand-bg flex items-center gap-3 transition-colors border-b border-brand-bg last:border-0"
                        >
                          <div
                            className={`w-2 h-2 rounded-full transition-all ${formData.gender === option.value ? "bg-brand-teal scale-125" : "bg-brand-light/20"}`}
                          />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <label className={labelBase}>National ID</label>
                  <div className="relative">
                    <Hash
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                    />
                    <input
                      value={formData.nationalId}
                      onChange={(e) =>
                        setFormData({ ...formData, nationalId: e.target.value })
                      }
                      required
                      className={inputBase}
                      placeholder="Gov ID Number"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelBase}>Internal ID Card</label>
                  <div className="relative">
                    <Hash
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                    />
                    <input
                      value={formData.idCardNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          idCardNumber: e.target.value,
                        })
                      }
                      placeholder="Registry Code (Optional)"
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-10 bg-white border-t border-brand-light/10 rounded-b-[3rem] shrink-0">
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="w-full py-6 bg-brand-deep text-white font-black rounded-2xl shadow-2xl shadow-brand-deep/10 hover:bg-brand-teal active:scale-[0.98] transition-all disabled:opacity-20 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Re-Syncing Data...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Commit Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EditStudentModal;
