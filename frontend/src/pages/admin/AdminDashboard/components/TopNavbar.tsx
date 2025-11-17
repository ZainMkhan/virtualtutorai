import React from 'react';
import { Menu, ChevronDown, LogOut } from 'lucide-react';
import type { UserProfile } from '../../../../services/api';

interface TopNavbarProps {
  onToggleSidebar: (open: boolean) => void;
  onLogout: () => void;
  userProfile: UserProfile | null;
  showUserMenu: boolean;
  onToggleUserMenu: (show: boolean) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  onLogout,
  userProfile,
  showUserMenu,
  onToggleUserMenu,
}) => {
  return (
    <nav className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onToggleSidebar(true)}
          className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Welcome back, Administrator</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => onToggleUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {userProfile?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{userProfile?.email || 'Admin'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-300 rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
