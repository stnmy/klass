import { type Student } from "../../pages/GroupManagement";
import { Edit2, Trash2, Check } from "lucide-react";

interface MemberRowProps {
  student: Student;
  onEdit?: (student: Student) => void;
  onDelete?: (id: string) => void;
  children?: React.ReactNode; // This will hold the groups in the middle column
}

/**
 * MemberRow: Now uses a 3-column Grid layout
 * Col 1: Student Details (1.5fr)
 * Col 2: Groups/Middle Content (1fr)
 * Col 3: Actions (Auto)
 */
export const MemberRow = ({
  student,
  onEdit,
  onDelete,
  children,
}: MemberRowProps) => (
  /* Changed to repeat(3, 1fr) for equal 33% width columns */
  <div className="px-6 py-4 grid grid-cols-3 items-center gap-4 group transition-all hover:bg-brand-bg/30">
    {/* COLUMN 1: STUDENT INFO (Aligned Left) */}
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-10 h-10 shrink-0 rounded-full bg-brand-bg flex items-center justify-center text-xs font-black text-brand-muted border border-brand-light/10 shadow-sm">
        {student.userName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-brand-deep uppercase tracking-tight leading-none mb-1 truncate">
          {student.userName}
        </p>
        <p className="text-[11px] text-brand-muted font-bold leading-none truncate">
          {student.email}
        </p>
      </div>
    </div>

    {/* COLUMN 2: GROUPS (Centered) */}
    <div className="flex justify-center min-w-0">
      <div className="flex flex-wrap gap-1 justify-center">{children}</div>
    </div>

    {/* COLUMN 3: ACTIONS (Aligned Right) */}
    <div className="flex items-center gap-1 justify-end">
      {(onEdit || onDelete) && (
        <>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(student);
              }}
              className="p-2 text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(student.id);
              }}
              className="p-2 text-red-500 hover:bg-red-50/80 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </>
      )}
    </div>
  </div>
);

/**
 * CandidateRow: Used in Add Students modal/tab
 */
export const CandidateRow = ({
  student,
  isSelected,
  onToggle,
}: {
  student: Student;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) => (
  <label
    className={`flex items-center px-4 py-3 cursor-pointer transition-all rounded-xl my-1 border ${
      isSelected
        ? "bg-brand-teal/5 border-brand-teal/20 shadow-sm"
        : "hover:bg-brand-bg border-transparent"
    }`}
  >
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-brand-light/40 transition-all checked:bg-brand-teal checked:border-brand-teal"
        checked={isSelected}
        onChange={() => onToggle(student.id)}
      />
      <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[4px]" />
    </div>
    <div className="ml-4">
      <p className="text-sm font-black text-brand-deep uppercase tracking-tight">
        {student.userName}
      </p>
      <p className="text-[11px] text-brand-muted font-bold">{student.email}</p>
    </div>
  </label>
);
