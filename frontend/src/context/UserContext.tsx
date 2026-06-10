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
  clearUser: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  clearUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    getProfile()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const clearUser = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
