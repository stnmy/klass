import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/userContext";
import ProtectedRoute from "./components/protectedRoutes";
import Navbar from "./components/navbar";

// Page Imports
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import CreateStudent from "./components/GroupManagement/CreateStudentModal";
import StudentList from "./pages/StudentList";
import MeetingPage from "./pages/MeetingPage";
import InitiateClass from "./pages/Initiate";
import GroupManagement from "./pages/GroupManagement";
import NotFound from "./pages/NotFound";
import TeacherRoute from "./Routes/teacherRoutes";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <div className="min-h-screen bg-brand-bg text-brand-deep font-sans selection:bg-brand-light/30">
          <Navbar />

          <main className="animate-in fade-in duration-700">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Student/General Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/meeting" element={<MeetingPage />} />

              {/* Teacher Only Routes */}
              <Route element={<TeacherRoute />}>
                <Route path="/createstudent" element={<CreateStudent />} />
                <Route path="/students" element={<StudentList />} />
                <Route path="/startClass" element={<InitiateClass />} />
                <Route path="/group" element={<GroupManagement />} />
              </Route>

              {/* Error Routes */}
              <Route
                path="/unauthorized"
                element={
                  <div className="flex items-center justify-center h-[80vh]">
                    <h2 className="text-2xl font-bold text-brand-muted uppercase tracking-widest">
                      Access Denied
                    </h2>
                  </div>
                }
              />

              {/* 404 Catch-all: Must be the last route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
