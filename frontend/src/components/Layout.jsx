import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  PlusCircle,
  Brain,
  FileBarChart,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Wallet,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: PlusCircle },
  { to: '/insights', label: 'AI Insights', icon: Brain },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-[260px] flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${dark
            ? 'bg-slate-900 border-r border-slate-700/50'
            : 'bg-white border-r border-slate-200/70'
          }
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-[72px] flex-shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <Wallet className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ExpenseAI</h1>
            <p className={`text-[11px] font-medium ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
              Smart Tracker
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? dark
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                    : 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : dark
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        <div className={`px-4 py-4 border-t ${dark ? 'border-slate-700/50' : 'border-slate-200/70'}`}>
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border ${dark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-700 border-slate-200'}`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className={`text-xs truncate ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggle}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {dark ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className={`
          lg:hidden flex items-center justify-between px-4 h-[60px] flex-shrink-0 border-b
          ${dark ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200/70'}
        `}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <Wallet className="w-4 h-4 text-primary-500" />
            </div>
            <span className="font-bold text-base">ExpenseAI</span>
          </div>
          <button onClick={toggle} className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 ${dark ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
