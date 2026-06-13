import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Camera,
  FileText,
  Lightbulb,
  User,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';

export const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Food Log', path: '/log', icon: PlusCircle },
    { name: 'Image Analysis', path: '/image-analysis', icon: Camera },
    { name: 'Text Analysis', path: '/text-analysis', icon: FileText },
    { name: 'AI Recommendations', path: '/recommendations', icon: Lightbulb },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-neonBlue animate-pulse" />
          <span className="font-orbitron font-extrabold tracking-widest text-slate-100 text-sm">
            NUTRIMIND<span className="text-neonPurple font-bold">AI</span>
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-300 hover:text-neonBlue transition-colors p-1"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Dropdown Navigation */}
      {isOpen && (
        <nav className="md:hidden fixed inset-x-0 top-[65px] bg-[#0a0a16]/95 border-b border-white/10 p-6 flex flex-col gap-4 z-40 backdrop-blur-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg font-orbitron text-xs tracking-wider transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-neonBlue/10 border-l-2 border-neonBlue text-neonBlue glow-text-blue'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          {user && (
            <button
              onClick={() => {
                setIsOpen(false);
                logoutUser();
              }}
              className="flex items-center gap-4 px-4 py-3 rounded-lg font-orbitron text-xs tracking-wider text-cyberPink hover:bg-cyberPink/10 transition-all duration-200 border-l-2 border-transparent hover:border-cyberPink"
            >
              <LogOut className="w-5 h-5" />
              SIGN OUT
            </button>
          )}
        </nav>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[#070716] border-r border-white/5 p-6 fixed left-0 top-0 z-30">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 px-2 py-4 mb-8">
          <Activity className="w-7 h-7 text-neonBlue animate-pulse" />
          <span className="font-orbitron font-black tracking-widest text-slate-100 text-lg">
            NUTRIMIND<span className="text-neonPurple font-bold">AI</span>
          </span>
        </div>

        {/* User Card */}
        {user && (
          <div className="glass-panel p-4 rounded-xl border-l-4 border-neonPurple mb-8 flex flex-col gap-1">
            <span className="text-[10px] font-orbitron font-semibold tracking-wider text-slate-400 uppercase">
              ACTIVE USER
            </span>
            <span className="font-orbitron font-bold text-slate-100 truncate">
              {user.username}
            </span>
            <span className="text-xs text-neonBlue font-semibold font-orbitron">
              ID: {user.user_id}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-lg font-orbitron text-xs tracking-wider transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-neonBlue/10 border-l-2 border-neonBlue text-neonBlue glow-text-blue'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        {user && (
          <button
            onClick={logoutUser}
            className="flex items-center gap-4 px-4 py-3.5 mt-auto rounded-lg font-orbitron text-xs tracking-wider text-cyberPink hover:bg-cyberPink/10 transition-all duration-300 border-l-2 border-transparent hover:border-cyberPink cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            SIGN OUT
          </button>
        )}
      </aside>
    </>
  );
};
