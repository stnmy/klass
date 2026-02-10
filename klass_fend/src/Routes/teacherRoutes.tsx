import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/userContext";

const TeacherRoute = () => {
  const { user } = useUser();

  // Still loading user info
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not a teacher
  if (user.role !== "Teacher") {
    return <Navigate to="/login" replace />;
  }

  // Is teacher → allow access
  return <Outlet />;
};

export default TeacherRoute;
