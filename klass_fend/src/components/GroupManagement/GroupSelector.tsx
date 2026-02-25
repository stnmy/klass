import { useState, useRef, useEffect } from "react";
import { Users, ChevronDown, CheckCircle2 } from "lucide-react";
import { type Group } from "../../pages/GroupManagement";

interface GroupSelectorProps {
  groups: Group[];
  activeGroup?: Group;
  onSelect: (id: number) => void;
}

const GroupSelector = ({
  groups,
  activeGroup,
  onSelect,
}: GroupSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white px-6 py-4 rounded-[1.5rem] border transition-all flex items-center justify-between group ${
          isOpen
            ? "border-brand-teal ring-4 ring-brand-teal/5 shadow-md"
            : "border-brand-light/20 shadow-sm hover:border-brand-teal/40"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-2 rounded-xl transition-colors ${
              activeGroup
                ? "bg-brand-teal text-white"
                : "bg-brand-bg text-brand-muted"
            }`}
          >
            <Users size={18} />
          </div>
          <div className="text-left">
            <p
              className={`text-xs font-black uppercase tracking-widest ${
                activeGroup ? "text-brand-deep" : "text-brand-muted"
              }`}
            >
              {activeGroup ? activeGroup.name : "Select Group"}
            </p>
            {activeGroup && (
              <p className="text-[10px] font-bold text-brand-teal uppercase">
                {activeGroup.groupStudents.length} Existing Members
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`text-brand-muted transition-transform duration-300 ${
            isOpen ? "rotate-180 text-brand-teal" : ""
          }`}
          size={20}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-brand-light/10 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {groups.length === 0 ? (
              <div className="px-6 py-8 text-center opacity-40">
                <p className="text-[10px] font-black uppercase tracking-widest">
                  No groups available
                </p>
              </div>
            ) : (
              groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b border-brand-bg/50 last:border-0 ${
                    activeGroup?.id === g.id
                      ? "bg-brand-teal/5"
                      : "hover:bg-brand-bg"
                  }`}
                  onClick={() => {
                    onSelect(g.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-black text-xs uppercase tracking-wider ${
                        activeGroup?.id === g.id
                          ? "text-brand-teal"
                          : "text-brand-deep"
                      }`}
                    >
                      {g.name}
                    </span>
                    <span className="text-[9px] text-brand-muted uppercase font-bold">
                      {g.groupStudents.length} Students
                    </span>
                  </div>
                  {activeGroup?.id === g.id && (
                    <CheckCircle2 size={16} className="text-brand-teal" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSelector;
