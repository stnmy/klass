import { useEffect, useState } from "react";
import api from "../api/axios";

type Student = {
  userName: string;
  email: string;
};

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/user/GetAllStudents");
        setStudents(res.data);
      } catch (err: any) {
        setError(
          err.response?.data
            ? JSON.stringify(err.response.data)
            : "Failed to load students",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4">
      <div className="w-full max-w-4xl mt-16">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8 tracking-tight">
          Students
        </h1>

        {loading && <p className="text-gray-500">Loading students...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && students.length === 0 && (
          <p className="text-gray-500">No students found.</p>
        )}

        {!loading && students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {students.map((s, index) => (
              <div
                key={s.userName}
                className={`flex justify-between items-center px-6 py-4 ${
                  index !== students.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div>
                  <p className="text-gray-900 font-medium">{s.userName}</p>
                  <p className="text-gray-500 text-sm">{s.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
