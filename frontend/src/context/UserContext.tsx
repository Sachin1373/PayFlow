import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getProfile } from "@/services/auth.service";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
}

interface UserContextValue {
  user: UserProfile | null;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  refreshUser: async () => {},
  clearUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const clearUser = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, refreshUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
