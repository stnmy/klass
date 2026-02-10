// src/context/UserContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";

export interface User {
  id: number;
  name: string;
  role: string;
  email?: string; // optional if backend might not send
}

interface UserContextType {
  user: User | null | undefined; // undefined = loading, null = not logged in
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me"); // cookie validated by backend
        setUser(response.data); // authenticated user
      } catch {
        setUser(null); // not logged in
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// custom hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
};
