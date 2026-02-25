import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import api from "../../api/axios";

interface StudentForm {
  userName: string;
  email: string;
  fullName: string;
  password: string;
  gender: string;
  nationalId: string;
  idCardNumber: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStudentCreated: () => void;
}

const CreateStudentModal = ({ isOpen, onClose, onStudentCreated }: Props) => {
  const initialFormState: StudentForm = {
    userName: "",
    email: "",
    fullName: "",
    password: "",
    gender: "",
    nationalId: "",
    idCardNumber: "",
  };

  const [form, setForm] = useState<StudentForm>(initialFormState);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const genderOptions = [
    { value: "1", label: "Male" },
    { value: "2", label: "Female" },
    { value: "3", label: "Other" },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      // Reset state on close
      setForm(initialFormState);
      setMessage(null);
      setShowSuccess(false);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenderOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectGender = (val: string) => {
    setForm((prev) => ({ ...prev, gender: val }));
    setIsGenderOpen(false);
  };

  const handleSubmit = async () => {
    if (!form.gender) {
      setMessage({ text: "Please select a gender", isError: true });
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, gender: Number(form.gender) };
      await api.post("/user/CreateStudent", payload);
      setShowSuccess(true);
      setTimeout(() => {
        onStudentCreated();
        onClose();
      }, 1500);
    } catch (err: any) {
      setMessage({
        text: err.response?.data || "Check input data",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputBase =
    "w-full p-5 bg-white rounded-2xl border border-brand-light/20 focus:border-brand-teal focus:ring-4 ring-brand-teal/5 transition-all text-sm font-bold text-brand-deep outline-none";
  const labelBase =
    "text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep/40 ml-1 mb-2 flex items-center gap-2";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-brand-deep/20 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* MODAL CONTAINER - No fixed height, centered via flex parent */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-brand-bg rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/40 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-brand-light/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-deep">
                Initialize Student
              </h2>
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
                Workspace / Identity Registry
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

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {showSuccess ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-brand-teal text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-brand-teal/20">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-brand-deep uppercase tracking-tighter">
                  Registry Created
                </h3>
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em]">
                  System Synchronization Complete
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {/* Username */}
                <div className="flex flex-col">
                  <label className={labelBase}>Username</label>
                  <input
                    name="userName"
                    value={form.userName}
                    onChange={handleChange}
                    className={inputBase}
                    autoComplete="off"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className={labelBase}>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputBase}
                    autoComplete="off"
                  />
                </div>

                {/* Full Name */}
                <div className="flex flex-col md:col-span-2">
                  <label className={labelBase}>Full Legal Name</label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className={inputBase}
                    autoComplete="off"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col relative">
                  <label className={labelBase}>Access Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      className={inputBase}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-teal transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Gender Dropdown */}
                <div className="flex flex-col relative" ref={dropdownRef}>
                  <label className={labelBase}>Gender Selection</label>
                  <button
                    type="button"
                    onClick={() => setIsGenderOpen(!isGenderOpen)}
                    className={`${inputBase} text-left flex items-center justify-between uppercase tracking-widest`}
                  >
                    <span>
                      {genderOptions.find((o) => o.value === form.gender)
                        ?.label || ""}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${isGenderOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isGenderOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-light/20 rounded-2xl shadow-2xl z-[210] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {genderOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => selectGender(option.value)}
                          className="w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-brand-deep hover:bg-brand-bg flex items-center gap-4 transition-colors"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${form.gender === option.value ? "bg-brand-teal" : "bg-brand-light/20"}`}
                          />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* National ID */}
                <div className="flex flex-col">
                  <label className={labelBase}>National ID</label>
                  <input
                    name="nationalId"
                    value={form.nationalId}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>

                {/* Internal ID */}
                <div className="flex flex-col">
                  <label className={labelBase}>Internal ID</label>
                  <input
                    name="idCardNumber"
                    value={form.idCardNumber}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`p-5 rounded-2xl flex items-center justify-center gap-4 animate-in slide-in-from-top-2 ${message.isError ? "bg-red-50 text-red-600" : "bg-brand-teal/5 text-brand-teal"}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    {message.text}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {!showSuccess && (
          <div className="p-8 bg-white border-t border-brand-light/10 shrink-0">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-5 bg-brand-deep text-white font-black rounded-2xl shadow-xl hover:bg-brand-teal active:scale-[0.98] transition-all disabled:opacity-20 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {loading ? "Syncing..." : "Finalize Student Registry"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default CreateStudentModal;
