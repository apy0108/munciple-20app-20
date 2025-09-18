import Dashboard from "./Dashboard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const { user } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (user?.role === "FIELD_STAFF") nav("/tasks", { replace: true });
  }, [user, nav]);
  return <Dashboard />;
}
