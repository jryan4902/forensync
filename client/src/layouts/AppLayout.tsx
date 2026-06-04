import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, FolderOpen, Settings, ShieldCheck } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cases", label: "Cases", icon: FolderOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      <aside className="w-56 shrink-0 border-r border-gray-800 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-blue-400 shrink-0" />
          <span className="text-white font-semibold tracking-wide">ForenSync</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors border-l-2 ${
                  isActive
                    ? "bg-gray-800/70 text-white border-blue-500"
                    : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} className={isActive ? "text-blue-400" : "text-gray-500"} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
