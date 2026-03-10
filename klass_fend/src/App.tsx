import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Outlet,
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

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("user_name");
    if (!user && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [navigate, location]);

  return <>{children}</>;
};

/**
 * Layout wrapper for pages that NEED the Navbar and standard padding.
 */
const MainLayout = () => (
  <div className="min-h-screen bg-brand-bg text-brand-deep font-sans selection:bg-brand-light/30">
    <Navbar />
    {/* pt-20 added here so it ONLY affects pages inside this layout */}
    <main className="animate-in fade-in duration-700 min-h-screen pt-20">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AuthGuard>
          <Routes>
            {/* 1. PUBLIC ROUTES (No Navbar) */}
            <Route path="/login" element={<Login />} />

            {/* 2. MEETING ROUTE (No Navbar, No pt-20 padding) */}
            <Route
              path="/meeting"
              element={
                <ProtectedRoute>
                  <MeetingPage />
                </ProtectedRoute>
              }
            />

            {/* 3. STANDARD APP ROUTES (With Navbar & Padding) */}
            <Route element={<MainLayout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
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
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthGuard>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
