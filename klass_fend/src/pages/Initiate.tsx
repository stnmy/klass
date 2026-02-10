import { useEffect, useState, useMemo } from "react";
import {
  User,
  Users,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import api from "../api/axios";
import { StudentRoster } from "../components/ClassManagement/StudentRoaster";
import { LiveSessionStatus } from "../components/ClassManagement/LiveSessionStatus";

const InitiateClass = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeStudents, setActiveStudents] = useState<string[]>([]);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  const [mode, setMode] = useState<"individual" | "group">("individual");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStudents(),
        fetchGroups(),
        fetchActiveStudents(),
      ]);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/user/GetAllStudents");
      setStudents(res.data);
    } catch {
      setMessage({ type: "error", text: "Failed to load student roster." });
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get("/user/GetTeacherGroups");
      setGroups(res.data);
    } catch {
      console.error("Groups unavailable.");
    }
  };

  const fetchActiveStudents = async () => {
    try {
      const res = await api.get("/user/GetActiveStudents");
      setActiveStudents(res.data);
    } catch {
      console.error("Sync failed.");
    }
  };

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroup(groupId);
    if (!groupId) {
      setSelectedEmails([]);
      setGroupMembers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/user/GetGroupMembers/${groupId}`);
      setGroupMembers(res.data);
      setSelectedEmails(res.data.map((m: any) => m.email));
    } catch {
      setMessage({ type: "error", text: "Error loading group members." });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    let baseList = mode === "group" ? groupMembers : students;
    if (mode === "group" && !selectedGroup) return [];
    return baseList.filter(
      (s) =>
        s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [students, groupMembers, searchQuery, mode, selectedGroup]);

  const toggleStudent = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );
  };

  const handleAction = async (action: "start" | "end") => {
    if (action === "end") {
      setShowClearModal(true);
      return;
    }
    executeAction("start");
  };

  const executeAction = async (action: "start" | "end") => {
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    setShowClearModal(false);

    try {
      if (action === "start") {
        if (selectedEmails.length > 25) throw new Error("Max 25 students.");
        await api.post("/user/AssignStudents", {
          studentEmails: selectedEmails,
        });
        setMessage({
          type: "success",
          text: `Successfully assigned ${selectedEmails.length} students.`,
        });
        setSelectedEmails([]);
        setSelectedGroup("");
        setGroupMembers([]);
      } else {
        await api.post("/user/ClearSession");
        setMessage({
          type: "success",
          text: "Class session cleared successfully.",
        });
      }
      await fetchActiveStudents();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data || err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg/30 pt-24 pb-12 px-6 font-sans">
      {/* CLEAR SESSION MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-deep/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-red-50 rounded-2xl text-red-500">
                <AlertTriangle size={32} />
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-muted"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-brand-deep tracking-tight">
                Clear Session?
              </h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                Disconnecting{" "}
                <span className="font-bold text-brand-deep">
                  {activeStudents.length}
                </span>{" "}
                students.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-brand-light/20 text-brand-muted font-bold text-sm hover:bg-brand-bg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => executeAction("end")}
                className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-brand-deep">
              Class Control
            </h1>
            <div className="flex bg-white p-1 rounded-xl border border-brand-light/20 w-fit">
              <button
                onClick={() => {
                  setMode("individual");
                  setSelectedEmails([]);
                  setSelectedGroup("");
                  setGroupMembers([]);
                }}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${mode === "individual" ? "bg-brand-deep text-white shadow-md" : "text-brand-muted hover:text-brand-deep"}`}
              >
                <User size={13} /> Individual
              </button>
              <button
                onClick={() => {
                  setMode("group");
                  setSelectedEmails([]);
                  setSelectedGroup("");
                  setGroupMembers([]);
                }}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${mode === "group" ? "bg-brand-deep text-white shadow-md" : "text-brand-muted hover:text-brand-deep"}`}
              >
                <Users size={13} /> Group
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              disabled={submitting || activeStudents.length === 0}
              onClick={() => handleAction("end")}
              className="px-5 py-2.5 rounded-xl border-2 border-red-100 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-30"
            >
              Clear Session
            </button>
            <button
              disabled={selectedEmails.length === 0 || submitting}
              onClick={() => handleAction("start")}
              className="px-6 py-2.5 rounded-xl bg-brand-deep text-white font-black text-[10px] uppercase tracking-widest hover:bg-brand-teal transition-all shadow-lg shadow-brand-deep/20 disabled:opacity-50"
            >
              {submitting ? "Syncing..." : `Start (${selectedEmails.length})`}
            </button>
          </div>
        </header>

        {/* UPDATED MESSAGE BAR WITH CLOSE BUTTON */}
        {message.text && (
          <div
            className={`p-3 px-5 rounded-2xl border-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${message.type === "error" ? "bg-red-50 border-red-100 text-red-600" : "bg-brand-teal/10 border-brand-teal/20 text-brand-teal"}`}
          >
            <div className="flex items-center gap-3">
              {message.type === "error" ? (
                <ShieldAlert size={18} />
              ) : (
                <CheckCircle size={18} />
              )}
              <span className="font-bold text-xs uppercase tracking-tight">
                {message.text}
              </span>
            </div>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ensure you pass h-[580px] or similar into these components internally */}
          <StudentRoster
            mode={mode}
            loading={loading}
            students={filteredStudents}
            groups={groups}
            selectedGroup={selectedGroup}
            selectedEmails={selectedEmails}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onGroupChange={handleGroupChange}
            onToggleStudent={toggleStudent}
          />
          <LiveSessionStatus
            activeStudents={activeStudents}
            onSync={fetchActiveStudents}
          />
        </div>
      </div>
    </div>
  );
};

export default InitiateClass;
