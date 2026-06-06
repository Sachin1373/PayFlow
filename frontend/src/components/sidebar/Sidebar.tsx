import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 border-r bg-white">
      <div className="p-5 text-xl font-bold">
        PayFlow
      </div>

      <nav className="flex flex-col gap-2 p-3">
        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/invoices">
          Invoices
        </NavLink>

        <NavLink to="/orders">
          Orders
        </NavLink>

        <NavLink to="/customers">
          Customers
        </NavLink>

        <NavLink to="/settings">
          Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;