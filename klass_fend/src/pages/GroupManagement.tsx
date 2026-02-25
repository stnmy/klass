import { useEffect, useState } from "react";
import { UserPlus, UserMinus, Database, Users } from "lucide-react";
import api from "../api/axios";
import AddStudentsTab from "../components/GroupManagement/AddStudentsTab";
import RemoveStudentsTab from "../components/GroupManagement/RemoveStudentsTab";
import StudentListTab from "../components/GroupManagement/StudentListTab";

export interface Student {
  id: string;
  userName: string;
  email: string;
}
export interface Group {
  id: number;
  name: string;
  groupStudents: { studentId: string }[];
}

const GroupManagement = () => {
  const [activeTab, setActiveTab] = useState<"studentlist" | "add" | "remove">(
    "studentlist",
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentRes, groupRes] = await Promise.all([
        api.get("/user/GetAllStudents"),
        api.get("/user/GetTeacherGroups"),
      ]);
      setStudents(studentRes.data || []);
      setGroups(groupRes.data || []);
    } catch (err) {
      console.error("Sync error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs = [
    { id: "studentlist", label: "Students", icon: Users },
    { id: "add", label: "Add", icon: UserPlus },
    { id: "remove", label: "Remove", icon: UserMinus },
  ] as const;

  return (
    <div className="relative min-h-screen bg-brand-bg/30 font-sans pt-16">
      <div className="max-w-5xl mx-auto px-4 md:px-0">
        <nav className="bg-white p-1.5 rounded-[2rem] shadow-xl border border-brand-light/20 mt-4">
          <div className="flex flex-row items-center justify-between gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.4rem] font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300 ${
                    isActive
                      ? "bg-brand-deep text-white scale-[1.02]"
                      : "text-brand-muted hover:bg-brand-bg/50"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      isActive ? "text-brand-teal" : "text-brand-muted"
                    }
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="mt-10 pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-[2rem] border border-white/20 backdrop-blur-sm">
              <div className="relative flex items-center justify-center mb-6">
                <div className="w-16 h-16 border-4 border-brand-light/10 border-t-brand-teal rounded-full animate-spin" />
                <Database className="absolute text-brand-deep" size={20} />
              </div>
              <p className="font-black text-brand-deep/40 tracking-[0.4em] text-[10px] uppercase">
                Refreshing Database
              </p>
            </div>
          ) : (
            /* FIX: Animation classes (animate-in fade-in) removed. 
               The content will now snap into place instantly when loading finishes.
            */
            <div>
              {activeTab === "studentlist" && (
                <StudentListTab
                  students={students}
                  groups={groups}
                  onUpdate={loadData}
                />
              )}
              {activeTab === "add" && (
                <AddStudentsTab
                  students={students}
                  onUpdate={loadData}
                  groups={groups}
                />
              )}
              {activeTab === "remove" && (
                <RemoveStudentsTab
                  students={students}
                  groups={groups}
                  onUpdate={loadData}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupManagement;
