import { useState, useMemo } from "react";
import { Users, Info, UserPlus2, Database, Search } from "lucide-react";
import type { Student, Group } from "../../pages/GroupManagement";

// Internal Sub-Components
import StudentListCard from "./StudentListCard";
import { MemberRow } from "./StudentRows";

// Modal Components
import CreateStudentModal from "./CreateStudentModal";
import EditStudentModal from "./EditStudentModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

import api from "../../api/axios";

interface Props {
  students: Student[];
  groups: Group[];
  onUpdate: () => void;
}

const StudentListTab = ({ students, groups, onUpdate }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.userName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term),
    );
  }, [students, searchTerm]);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;
    setDeleting(true);
    try {
      await api.delete(`/user/DeleteStudent/${selectedStudent.id}`);
      onUpdate();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
      setSelectedStudent(null);
    }
  };

  // Standardized UI Classes
  const labelBase =
    "text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep/40 ml-4 mb-2 flex items-center gap-2";
  const actionButtonBase =
    "h-[64px] flex items-center justify-center gap-3 px-8 bg-white border border-brand-light/20 rounded-[1.5rem] shadow-sm hover:border-brand-teal hover:shadow-md active:scale-[0.98] transition-all group shrink-0";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Modals - Now using Portals inside their own files */}
      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStudentCreated={onUpdate}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        studentId={selectedStudent?.id || null}
        onStudentUpdated={onUpdate}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        studentName={selectedStudent?.userName || ""}
        loading={deleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Header Controls Area */}
      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 w-full min-w-0">
          <label className={labelBase}>
            <Database size={12} /> Master Database
          </label>
          <div className="relative h-16 w-full bg-white border border-brand-light/20 rounded-3xl shadow-sm flex items-center px-6 focus-within:border-brand-teal focus-within:ring-4 focus-within:ring-brand-teal/5 transition-all">
            <Search className="text-brand-muted/40 mr-3" size={18} />
            <input
              type="text"
              placeholder="SEARCH STUDENT RECORDS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-[11px] font-black uppercase tracking-widest text-brand-deep placeholder:text-brand-muted/30"
            />
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={actionButtonBase}
        >
          <div className="p-2 rounded-xl bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors">
            <UserPlus2 size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-deep">
            Create Student
          </span>
        </button>
      </div>

      {/* Main List Display */}
      <StudentListCard
        title="Database Overview"
        icon={<Users size={16} />}
        count={filteredStudents.length}
        countLabel="Total Students"
        hideSearch
      >
        {filteredStudents.length > 0 ? (
          <div className="space-y-1">
            {filteredStudents.map((student) => {
              const studentGroups = groups.filter((g) =>
                g.groupStudents.some((gs) => gs.studentId === student.id),
              );

              return (
                <MemberRow
                  key={student.id}
                  student={student}
                  onEdit={() => handleEdit(student)}
                  onDelete={() => handleDeleteClick(student)}
                >
                  <div className="flex flex-wrap gap-1 justify-center">
                    {studentGroups.length > 0 ? (
                      studentGroups.slice(0, 2).map((g) => (
                        <span
                          key={g.id}
                          className="px-2.5 py-1 bg-brand-teal/5 text-brand-teal text-[9px] font-black uppercase rounded-full border border-brand-teal/10 whitespace-nowrap"
                        >
                          {g.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] font-bold text-brand-muted/20 uppercase tracking-[0.3em]">
                        Unassigned
                      </span>
                    )}
                    {studentGroups.length > 2 && (
                      <span className="text-[9px] font-bold text-brand-muted/40 ml-1">
                        +{studentGroups.length - 2}
                      </span>
                    )}
                  </div>
                </MemberRow>
              );
            })}
          </div>
        ) : (
          <div className="w-full py-24 flex flex-col items-center justify-center space-y-4 opacity-30">
            <div className="p-6 bg-brand-bg rounded-full">
              <Info size={48} strokeWidth={1} />
            </div>
            <p className="text-brand-deep font-black uppercase text-[10px] tracking-[0.3em]">
              No matching records found
            </p>
          </div>
        )}
      </StudentListCard>
    </div>
  );
};

export default StudentListTab;
