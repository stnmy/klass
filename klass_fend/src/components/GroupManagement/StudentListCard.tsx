import { type ReactNode } from "react";
import { Search } from "lucide-react";

interface CardProps {
  title: string;
  count: number;
  countLabel?: string;
  icon: ReactNode;
  searchTerm?: string; // Made optional since hideSearch might be true
  onSearchChange?: (val: string) => void; // Made optional
  children: ReactNode;
  isPrimary?: boolean;
  footer?: ReactNode;
  headerAction?: ReactNode;
  hideSearch?: boolean; // Added this property
}

const StudentListCard = ({
  title,
  count,
  countLabel = "",
  icon,
  searchTerm = "",
  onSearchChange,
  children,
  isPrimary = false,
  footer,
  headerAction,
  hideSearch = false, // Default to false
}: CardProps) => {
  return (
    <div
      className={`bg-white rounded-[2rem] border shadow-xl overflow-hidden flex flex-col h-[550px] transition-all ${
        isPrimary
          ? "border-brand-teal/20 ring-4 ring-brand-teal/5"
          : "border-brand-light/20"
      }`}
    >
      <div
        className={`p-5 border-b ${isPrimary ? "bg-brand-teal/5" : "bg-brand-bg/10"}`}
      >
        <div
          className={`flex justify-between items-center ${hideSearch ? "" : "mb-3"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isPrimary
                  ? "bg-brand-teal text-white"
                  : "bg-brand-deep/5 text-brand-deep/40"
              }`}
            >
              {icon}
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-deep">
              {title}
            </h3>
          </div>
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
              isPrimary ? "bg-brand-teal text-white" : "text-brand-teal"
            }`}
          >
            {count} {countLabel}
          </span>
        </div>

        {/* Conditionally render search bar area */}
        {!hideSearch && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
              />
              <input
                type="text"
                placeholder="Filter list..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-brand-light/20 rounded-xl text-xs outline-none focus:ring-2 ring-brand-teal/5"
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-brand-bg/50 px-2 custom-scrollbar">
        {children}
      </div>

      {footer && (
        <div className="p-5 bg-white border-t border-brand-bg">{footer}</div>
      )}
    </div>
  );
};

export default StudentListCard;
