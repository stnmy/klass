import {
  Search,
  GraduationCap,
  RefreshCw,
  Users,
  Check,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
  mode: "individual" | "group";
  loading: boolean;
  students: any[];
  groups: any[];
  selectedGroup: string;
  selectedEmails: string[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onGroupChange: (id: string) => void;
  onToggleStudent: (email: string) => void;
}

export const StudentRoster = ({
  mode,
  loading,
  students,
  groups,
  selectedGroup,
  selectedEmails,
  searchQuery,
  onSearchChange,
  onGroupChange,
  onToggleStudent,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentGroupName =
    groups.find((g) => String(g.id) === selectedGroup)?.name ||
    "Choose a Class Group...";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to check if all currently filtered students are selected
  const isAllSelected =
    students.length > 0 &&
    students.every((s) => selectedEmails.includes(s.email));

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Unselect only the ones currently visible in the filtered list
      students.forEach((s) => {
        if (selectedEmails.includes(s.email)) onToggleStudent(s.email);
      });
    } else {
      // Select all currently visible in the filtered list
      students.forEach((s) => {
        if (!selectedEmails.includes(s.email)) onToggleStudent(s.email);
      });
    }
  };

  return (
    <section className="bg-white border border-brand-light/20 rounded-[2rem] overflow-hidden shadow-2xl shadow-brand-deep/5 flex flex-col h-[580px] transition-all duration-300">
      {/* Header Section - Tightened Padding */}
      <div className="p-6 border-b border-brand-bg bg-brand-bg/10 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-deep/40 flex items-center gap-2">
            <GraduationCap size={14} />{" "}
            {mode === "group" ? "Group Selection" : "Student Roster"}
          </h3>
          <div className="flex items-center gap-2">
            {students.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-[10px] font-black uppercase text-brand-teal hover:text-brand-deep transition-colors mr-2"
              >
                {isAllSelected ? "Deselect All" : "Select All"}
              </button>
            )}
            <span className="bg-brand-teal text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {selectedEmails.length} Selected
            </span>
          </div>
        </div>

        {mode === "group" && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border transition-all duration-300 ${
                isOpen
                  ? "border-brand-teal ring-4 ring-brand-teal/5"
                  : "border-brand-light/30 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg ${selectedGroup ? "bg-brand-teal/10 text-brand-teal" : "bg-brand-bg text-brand-muted"}`}
                >
                  <Users size={16} />
                </div>
                <span
                  className={`text-xs font-bold ${selectedGroup ? "text-brand-deep" : "text-brand-muted"}`}
                >
                  {currentGroupName}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-brand-muted transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-teal" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-brand-light/20 shadow-2xl shadow-brand-deep/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                  {groups.length === 0 ? (
                    <div className="p-4 text-center text-xs text-brand-muted italic">
                      No groups available
                    </div>
                  ) : (
                    groups.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          onGroupChange(String(g.id));
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-brand-bg transition-colors text-left ${
                          selectedGroup === String(g.id)
                            ? "bg-brand-teal/5"
                            : ""
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p
                            className={`text-xs font-black ${selectedGroup === String(g.id) ? "text-brand-teal" : "text-brand-deep"}`}
                          >
                            {g.name}
                          </p>
                          <p className="text-[9px] text-brand-muted font-bold uppercase tracking-wider">
                            {g.memberCount || 0} Students
                          </p>
                        </div>
                        {selectedGroup === String(g.id) && (
                          <Check
                            size={12}
                            className="text-brand-teal"
                            strokeWidth={4}
                          />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-teal transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-light/30 rounded-xl text-xs font-medium focus:ring-4 focus:ring-brand-teal/5 focus:border-brand-teal transition-all placeholder:text-brand-muted/60"
          />
        </div>
      </div>

      {/* List Section */}
      <div className="overflow-y-auto flex-grow divide-y divide-brand-bg/50 px-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <RefreshCw className="animate-spin text-brand-deep" size={24} />
            <p className="text-[9px] font-black uppercase tracking-widest">
              Loading...
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-60">
            <Search size={24} className="text-brand-muted" />
            <p className="text-brand-muted text-xs italic">
              No students found.
            </p>
          </div>
        ) : (
          students.map((s) => (
            <label
              key={s.email}
              className={`flex items-center px-4 py-3 my-1.5 rounded-xl cursor-pointer transition-all border group ${
                selectedEmails.includes(s.email)
                  ? "bg-brand-teal/5 border-brand-teal/20"
                  : "hover:bg-brand-bg/50 border-transparent"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(s.email)}
                  onChange={() => onToggleStudent(s.email)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-brand-light/50 transition-all checked:bg-brand-teal checked:border-brand-teal"
                />
                <Check
                  className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                  strokeWidth={4}
                />
              </div>
              <div className="ml-4 flex-grow">
                <p
                  className={`text-xs font-black transition-colors ${selectedEmails.includes(s.email) ? "text-brand-teal" : "text-brand-deep"}`}
                >
                  {s.userName}
                </p>
                <p className="text-[10px] text-brand-muted font-medium">
                  {s.email}
                </p>
              </div>
            </label>
          ))
        )}
      </div>
    </section>
  );
};
