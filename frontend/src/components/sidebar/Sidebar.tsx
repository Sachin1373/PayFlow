import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, ShoppingCart, Users, Settings, LogOut } from "lucide-react";
import { jwtDecode } from 'jwt-decode';

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/settings", label: "Profile Setup", icon: Settings },
];

interface User {
  first_name: string;
  last_name: string;
  email: string;
  exp: number;
}

const ZapIcon = () => (
  <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 text-primary"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  </div>
);

const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      try {
        const decodedPayload = jwtDecode<User>(token);
        setUser(decodedPayload);

        const currentTime = Date.now() / 1000;
        if (decodedPayload.exp < currentTime) {
          console.warn('Token has expired!');
        }
      } catch (error) {
        console.error('Invalid token format:', error);
      }
    }
  }, []);

  const initials =
    user?.first_name?.[0] + user?.last_name?.[0] || "U";


  return (
    <aside className="w-64 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="flex items-center gap-2 p-5 font-semibold text-lg border-b border-sidebar-border">
        <ZapIcon />
        PayFlow
      </div>

      <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
              ${isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/60"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-sidebar-border p-3 shrink-0">
        <div className="flex items-center justify-between gap-2 w-full min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-medium text-sidebar-foreground shrink-0">
              {initials}
            </div>

            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-medium truncate">
                {user?.first_name} {user?.last_name}
              </span>

              <span className="text-xs text-sidebar-foreground/70 truncate max-w-[140px]" title={user?.email}>
                {user?.email}
              </span>
            </div>
          </div>
          <button className="p-2 rounded-md shrink-0">
            <LogOut className="w-4 h-4 text-sidebar-foreground/70" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;