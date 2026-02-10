import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
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
  const [formData, setFormData] = useState({
    userName: "",
    nationalId: "",
    idCardNumber: "",
    gender: 0, // Matches C# Gender Enum
  });

  // Fetch details when modal opens and studentId changes
  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/user/GetStudent/${studentId}`);
      // Only keep the fields that exist in your DB model
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
      alert("Failed to update student. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-deep/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 bg-brand-bg/50 border-b border-brand-light/10 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-brand-deep uppercase tracking-tighter">
              Edit Student
            </h3>
            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">
              Update Profile Information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-brand-teal" size={32} />
              <p className="text-[10px] font-black uppercase text-brand-muted tracking-widest">
                Loading Data...
              </p>
            </div>
          ) : (
            <>
              {/* USERNAME */}
              <div>
                <label className="block text-[10px] font-black text-brand-muted uppercase mb-1 ml-1">
                  Username (Display Name)
                </label>
                <input
                  className="w-full px-5 py-3.5 bg-brand-bg rounded-2xl border-none font-bold text-brand-deep focus:ring-2 focus:ring-brand-teal/50 transition-all"
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                  required
                />
              </div>

              {/* GENDER */}
              <div>
                <label className="block text-[10px] font-black text-brand-muted uppercase mb-1 ml-1">
                  Gender
                </label>
                <select
                  className="w-full px-5 py-3.5 bg-brand-bg rounded-2xl border-none font-bold text-brand-deep focus:ring-2 focus:ring-brand-teal/50 transition-all appearance-none"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: parseInt(e.target.value),
                    })
                  }
                >
                  <option value={0}>Male</option>
                  <option value={1}>Female</option>
                  <option value={2}>Other</option>
                </select>
              </div>

              {/* IDS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-brand-muted uppercase mb-1 ml-1">
                    National ID
                  </label>
                  <input
                    className="w-full px-5 py-3.5 bg-brand-bg rounded-2xl border-none font-bold text-brand-deep transition-all"
                    value={formData.nationalId}
                    onChange={(e) =>
                      setFormData({ ...formData, nationalId: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-muted uppercase mb-1 ml-1">
                    ID Card #
                  </label>
                  <input
                    className="w-full px-5 py-3.5 bg-brand-bg rounded-2xl border-none font-bold text-brand-deep transition-all"
                    value={formData.idCardNumber || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, idCardNumber: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 py-4 bg-brand-teal text-white font-black rounded-2xl shadow-xl hover:bg-brand-deep transition-all disabled:opacity-50 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving Changes..." : "Save Student Details"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
