import { Users, Info, UserPlus2 } from "lucide-react";
import { useState, useMemo } from "react";
import type { Student, Group } from "../../pages/GroupManagement";
import StudentListCard from "./StudentListCard";
import { MemberRow } from "./StudentRows";
import CreateStudentModal from "./CreateStudentModal";
import EditStudentModal from "./EditStudentModal";
import DeleteConfirmModal from "./DeleteConfirmModal"; // Import the new modal
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

  // DELETION STATE
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [students, searchTerm]);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  // Trigger Delete Warning
  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  // Perform actual API deletion
  const confirmDelete = async () => {
    if (!selectedStudent) return;
    setDeleting(true);
    try {
      await api.delete(`/user/DeleteStudent/${selectedStudent.id}`);
      onUpdate(); // Refresh the list
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete student.");
    } finally {
      setDeleting(false);
      setSelectedStudent(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      {/* NEW DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        studentName={selectedStudent?.userName || ""}
        loading={deleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <StudentListCard
        title="Database Overview"
        icon={<Users size={16} />}
        count={filteredStudents.length}
        countLabel="Total Students"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        headerAction={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-teal text-white rounded-xl hover:bg-brand-deep active:scale-95 transition-all shadow-lg shadow-brand-teal/20 group"
          >
            <UserPlus2
              size={16}
              className="group-hover:rotate-12 transition-transform"
            />
            <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
              Create Student
            </span>
          </button>
        }
      >
        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-brand-bg/50">
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
                      <span className="text-[9px] font-bold text-brand-muted/20 uppercase tracking-widest">
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
          <div className="h-full flex flex-col items-center justify-center py-32 opacity-20">
            <Info size={48} strokeWidth={1} />
            <p className="text-[11px] font-black uppercase tracking-[0.3em] mt-4">
              No matching records
            </p>
          </div>
        )}
      </StudentListCard>
    </div>
  );
};

export default StudentListTab;
