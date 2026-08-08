import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, Bell, ShieldCheck, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, title, searchQuery, setSearchQuery }) => {
  const { user, member } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-bold text-[#003366] tracking-tight">{title}</h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Bidii Seventh-day Adventist Church Management System
          </p>
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden lg:flex items-center relative max-w-xs w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Global search (Member, ID, Ref)..."
          className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all"
        />
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Badge */}
        <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[#003366] text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-400/40">
            {member ? member.fullName.charAt(0) : user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
              {member?.fullName || user?.username}
            </p>
            <span className="text-[10px] font-semibold text-amber-700">
              {user?.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
