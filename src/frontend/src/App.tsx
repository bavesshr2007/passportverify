import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import { UserRole } from "./backend";
import { AdminDashboard } from "./components/AdminDashboard";
import { ApplyForm } from "./components/ApplyForm";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { StatusLookup } from "./components/StatusLookup";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type View = "landing" | "apply" | "status" | "admin";

export default function App() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [currentView, setCurrentView] = useState<View>("landing");
  const [userRole, setUserRole] = useState<UserRole>(UserRole.guest);

  const checkRole = useCallback(async () => {
    if (!identity || !actor || isFetching) {
      if (!identity) setUserRole(UserRole.guest);
      return;
    }
    try {
      const role = await actor.getMyRole();
      setUserRole(role);
    } catch {
      setUserRole(UserRole.guest);
    }
  }, [identity, actor, isFetching]);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  const navigate = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentView={currentView}
        onNavigate={navigate}
        userRole={userRole}
        onRoleChange={setUserRole}
      />

      {currentView === "landing" && <LandingPage onNavigate={navigate} />}
      {currentView === "apply" && <ApplyForm />}
      {currentView === "status" && <StatusLookup />}
      {currentView === "admin" && <AdminDashboard onRoleChange={setUserRole} />}

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
