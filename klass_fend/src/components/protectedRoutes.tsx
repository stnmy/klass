// src/components/ProtectedRoute.tsx
import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useUser();

  if (user === undefined) return <div>Loading...</div>; // still fetching
  if (user === null) return <Navigate to="/login" replace />; // not authenticated

  return children; // user is authenticated
};

export default ProtectedRoute;
