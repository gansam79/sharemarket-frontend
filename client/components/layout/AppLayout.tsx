import { NavLink, Outlet } from "react-router-dom";
import { LogOut, Menu, Bell, BarChart3, Users, UserCog, Banknote, Repeat2, FileText, Mail, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useStore, createId } from "@/state/store";

export default function AppLayout() {
  const [open, setOpen] = useState(true);
  const { state, dispatch, isAdmin, role } = useStore();

  const signInAs = (r: "Admin" | "Shareholder" | "Stockholder") => {
    const user = {
      id: createId("user"),
      name: r === "Admin" ? "Admin" : r === "Shareholder" ? "Shareholder" : "Stockholder",
      email: `${r.toLowerCase()}@smmpro.app`,
      role: r,
    } as const;
    dispatch({ type: "SIGN_IN", payload: user });
  };

  const links = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/profiles", label: "Client Profiles", icon: FileText },
    { to: "/shareholders", label: "Shareholders", icon: Users },
    { to: "/stockholders", label: "Stockholders", icon: UserCog },
    { to: "/dmat", label: "DMAT Accounts", icon: Banknote },
    { to: "/transfers", label: "Share Transfers", icon: Repeat2 },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 text-foreground">
      <div className="flex">
        <aside className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ${open ? "w-64" : "w-20"} bg-sidebar text-sidebar-foreground border-r border-sidebar-border/60`}>
          <div className="flex items-center gap-2 px-4 py-4">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-content-center font-extrabold">S</div>
            {open && (
              <div className="leading-tight">
                <div className="font-bold tracking-tight">ShareMarket</div>
                <div className="text-xs opacity-80">Manager Pro</div>
              </div>
            )}
          </div>
          <nav className="px-2 space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-foreground" : "hover:bg-sidebar-accent/60"}`
                }
              >
                <Icon className="h-4 w-4" />
                {open && <span className="text-sm">{label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto p-3 space-y-2">
            {state.currentUser ? (
              <div className="text-xs space-y-2">
                <div className="rounded-md bg-accent/50 p-2">
                  <div className="font-medium">{state.currentUser.name}</div>
                  <div className="opacity-80">{state.currentUser.email}</div>
                  <div className="opacity-80">Role: {state.currentUser.role}</div>
                </div>
                <Button variant="secondary" className="w-full" onClick={() => dispatch({ type: "SIGN_OUT" })}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Button onClick={() => signInAs("Admin")}>Sign in as Admin</Button>
                <Button variant="secondary" onClick={() => signInAs("Shareholder")}>Shareholder</Button>
                <Button variant="secondary" onClick={() => signInAs("Stockholder")}>Stockholder</Button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)}>
                  <Menu />
                </Button>
                <div className="text-sm opacity-80">{role ? `Signed in as ${role}` : "Not signed in"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell />
                </Button>
              </div>
            </div>
          </header>
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
