import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileBarChart2,
  HandCoins,
  Package,
  Megaphone,
  Image,
  ShieldCheck,
  Settings,
  LogOut,
  Church,
  ChevronRight,
  UserCircle,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, isOpen, setIsOpen }) => {
  const { user, member, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role !== 'MEMBER';

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members Registry', icon: Users },
    { id: 'treasury', label: 'Treasury & Tithes', icon: Wallet },
    { id: 'reports', label: 'Financial Reports', icon: FileBarChart2 },
    { id: 'pledges', label: 'Pledge Tracker', icon: HandCoins },
    { id: 'assets', label: 'Church Assets', icon: Package },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'gallery', label: 'Church Gallery', icon: Image },
    ...(user.role === 'SUPER_ADMIN'
      ? [
          { id: 'audit-logs', label: 'Security Audit Logs', icon: ShieldCheck },
          { id: 'settings', label: 'System Settings & SQL', icon: Settings },
        ]
      : []),
  ];

  const memberNavItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'my-profile', label: 'My Profile', icon: UserCircle },
    { id: 'my-contributions', label: 'My Tithes & Receipts', icon: Wallet },
    { id: 'my-pledges', label: 'My Active Pledges', icon: HandCoins },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'gallery', label: 'Church Gallery', icon: Image },
  ];

  const navItems = isAdmin ? adminNavItems : memberNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#002244] text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Church className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm leading-tight text-white tracking-wide truncate">
              BIDII SDA CHURCH
            </h1>
            <p className="text-[11px] text-amber-400/90 font-medium tracking-tight">Management System</p>
          </div>
        </div>

        {/* User Badge Card */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <img
            src={
              member?.photoUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
            }
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-amber-400/30 shrink-0"
          />
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{member?.fullName || user.username}</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold rounded-full uppercase tracking-wider">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
