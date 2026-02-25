import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { UserProvider } from "./context/userContext";
import ProtectedRoute from "./components/protectedRoutes";
import Navbar from "./components/navbar";

// Page Imports
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import StudentList from "./pages/StudentList";
import MeetingPage from "./pages/MeetingPage";
import InitiateClass from "./pages/Initiate";
import GroupManagement from "./pages/GroupManagement";
import NotFound from "./pages/NotFound";
import TeacherRoute from "./Routes/teacherRoutes";

// A small sub-component to handle the global redirect logic
// We use a separate component because useNavigate must be inside BrowserRouter
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("user_name");

    // If no user exists and we aren't already on the login page, boot them to login
    if (!user && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [navigate, location]);

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AuthGuard>
          <div className="min-h-screen bg-brand-bg text-brand-deep font-sans selection:bg-brand-light/30">
            {/* Fixed Navbar */}
            <Navbar />

            {/* Main Content: 
                pt-20 ensures content starts 80px from the top, 
                leaving a clean gap below the 64px (h-16) Navbar.
            */}
            <main className="animate-in fade-in duration-700 min-h-screen">
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

                {/* Meeting page often needs to be full-screen, 
                    but still follows the pt-20 rule here */}
                <Route
                  path="/meeting"
                  element={
                    <ProtectedRoute>
                      <MeetingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Teacher Only Routes */}
                <Route element={<TeacherRoute />}>
                  <Route path="/students" element={<StudentList />} />
                  <Route path="/startClass" element={<InitiateClass />} />
                  <Route path="/group" element={<GroupManagement />} />
                </Route>

                {/* Error Routes */}
                <Route
                  path="/unauthorized"
                  element={
                    <div className="flex items-center justify-center h-[60vh]">
                      <div className="text-center">
                        <h2 className="text-2xl font-black text-brand-deep uppercase tracking-widest">
                          Access Denied
                        </h2>
                        <p className="text-brand-muted text-sm mt-2">
                          You don't have permission to view this page.
                        </p>
                      </div>
                    </div>
                  }
                />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </AuthGuard>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
