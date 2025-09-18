import { Link, useLocation } from "react-router-dom";
import { Bell, Gauge, Map, Settings, Users, Wrench, ClipboardList, LineChart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/complaints", label: "Complaints", icon: ClipboardList },
  { to: "/map", label: "Map View", icon: Map },
  { to: "/tasks", label: "Tasks", icon: Wrench },
  { to: "/reports", label: "Reports", icon: LineChart },
  { to: "/staff", label: "Staff Performance", icon: Users },
  { to: "/admin", label: "Admin Controls", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[280px_1fr] bg-gradient-to-br from-background to-background/70">
      <aside className="hidden lg:flex flex-col border-r bg-card/50 backdrop-blur">
        <div className="h-16 px-6 flex items-center border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/90" />
            <div>
              <p className="text-sm text-muted-foreground leading-none">Municipal CRM</p>
              <p className="font-semibold leading-none">City Admin</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-3">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
      </aside>

      <div className="flex flex-col min-w-0">
        <header className="h-16 border-b bg-card/50 backdrop-blur px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full">
            <Button variant="ghost" asChild className="lg:hidden">
              <Link to="/">Dashboard</Link>
            </Button>
            <div className="relative max-w-xl w-full hidden md:block">
              <input
                placeholder="Search complaints, wards, staff..."
                className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
