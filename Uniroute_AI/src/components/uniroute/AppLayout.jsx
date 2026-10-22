import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/uniroute/Sidebar";
import { useAuth } from "@/lib/AuthContext";
import { useStore } from "@/state/store";

export default function AppLayout() {
  const { user } = useAuth();
  const { ensureUser } = useStore();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (user) ensureUser(user);
    setReady(true);
  }, [user?.id]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="w-8 h-8 border-4 border-[#E4E7EC] border-t-[#253B80] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}