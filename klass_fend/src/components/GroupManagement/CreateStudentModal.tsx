import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Mail,
  User,
  Lock,
  Hash,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  X,
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
  const [showPassword, setShowPassword] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const payload = { ...form, gender: Number(form.gender) };
      await api.post("/user/CreateStudent", payload);

      setMessage({ text: "Account created successfully ✅", isError: false });

      setTimeout(() => {
        setForm(initialFormState);
        onStudentCreated();
        onClose();
        setMessage(null);
      }, 1500);
    } catch (err: any) {
      const errorText = err.response?.data || "An unexpected error occurred.";
      setMessage({
        text: typeof errorText === "string" ? errorText : "Check input data",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputBase =
    "w-full pl-12 pr-6 py-3 rounded-xl bg-brand-bg/50 border border-brand-light/20 text-brand-deep focus:outline-none focus:border-brand-teal transition-all text-sm placeholder:text-brand-muted/40";
  const labelBase =
    "text-[9px] uppercase tracking-widest font-black text-brand-deep/60 ml-1 flex items-center gap-2 mb-1.5";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-deep/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-brand-light/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-deep text-white flex items-center justify-center shadow-lg shadow-brand-deep/20">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-deep">
                Register Student
              </h2>
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
                New Academic Identity
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

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Field: Username */}
            <div className="flex flex-col">
              <label className={labelBase}>
                <User size={12} /> Username
              </label>
              <div className="relative group">
                <User
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                />
                <input
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  placeholder="stu_jdoe"
                  required
                  className={inputBase}
                />
              </div>
            </div>

            {/* Field: Email */}
            <div className="flex flex-col">
              <label className={labelBase}>
                <Mail size={12} /> Email Address
              </label>
              <div className="relative group">
                <Mail
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className={inputBase}
                />
              </div>
            </div>

            {/* Field: Full Name */}
            <div className="flex flex-col md:col-span-2">
              <label className={labelBase}>
                <User size={12} /> Full Legal Name
              </label>
              <div className="relative group">
                <User
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                />
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Johnathan Doe"
                  required
                  className={inputBase}
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="flex flex-col">
              <label className={labelBase}>
                <Lock size={12} /> Access Password
              </label>
              <div className="relative group">
                <Lock
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={inputBase}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Field: Gender */}
            <div className="flex flex-col">
              <label className={labelBase}>
                <ChevronDown size={12} /> Gender
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className={`${inputBase} appearance-none pl-6`}
                >
                  <option value="">Select</option>
                  <option value="1">Male</option>
                  <option value="2">Female</option>
                  <option value="3">Other</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted"
                />
              </div>
            </div>

            {/* Field: National ID */}
            <div className="flex flex-col">
              <label className={labelBase}>
                <Hash size={12} /> National ID
              </label>
              <div className="relative group">
                <Hash
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                />
                <input
                  name="nationalId"
                  value={form.nationalId}
                  onChange={handleChange}
                  placeholder="000-000-000"
                  required
                  className={inputBase}
                />
              </div>
            </div>

            {/* Field: ID Card */}
            <div className="flex flex-col">
              <label className={labelBase}>Internal ID (Optional)</label>
              <input
                name="idCardNumber"
                value={form.idCardNumber}
                onChange={handleChange}
                placeholder="Tracking #"
                className={`${inputBase} pl-6`}
              />
            </div>
          </div>

          {/* Feedback */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 animate-in slide-in-from-top-2 ${
                message.isError
                  ? "bg-red-50 text-red-600"
                  : "bg-brand-teal/10 text-brand-teal"
              }`}
            >
              {message.isError ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle size={18} />
              )}
              <p className="text-xs font-black uppercase tracking-tight">
                {message.text}
              </p>
            </div>
          )}
        </form>

        {/* Footer Action */}
        <div className="p-8 border-t border-brand-light/10 bg-brand-bg/20 rounded-b-[2.5rem]">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-brand-deep text-white font-black rounded-2xl shadow-xl hover:bg-brand-teal transition-all disabled:opacity-50 uppercase text-[10px] tracking-[0.2em]"
          >
            {loading ? "Initializing..." : "Register & Sync Student"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentModal;
