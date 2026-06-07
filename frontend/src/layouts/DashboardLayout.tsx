import { Outlet } from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="fixed inset-0 flex bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;