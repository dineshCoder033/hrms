import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  CalendarDays, 
  Clock, 
  CreditCard, 
  BriefcaseBusiness, 
  Award 
} from 'lucide-react';

export default function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutGrid },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/attendance', label: 'Attendance', icon: CalendarDays },
    { path: '/leaves', label: 'Leave Tracking', icon: Clock },
    { path: '/payroll', label: 'Payroll', icon: CreditCard },
    { path: '/recruitment', label: 'Recruitment', icon: BriefcaseBusiness },
    { path: '/performance', label: 'Performance', icon: Award },
  ];

  return (
    <aside className="w-12 sm:w-14 shrink-0 flex flex-col items-center">
      <nav className="bg-white/95 backdrop-blur-md border border-gray-200/70 rounded-full py-2.5 px-1.5 flex flex-col items-center gap-2 shadow-soft-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={item.label}
              className={`relative group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? 'bg-black text-white shadow-md scale-105' 
                  : 'text-gray-500 hover:text-black hover:bg-gray-100/80'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2]" />
              
              {/* Tooltip */}
              <span className="absolute left-14 bg-black text-white text-[11px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-50">
                {item.label}
              </span>

              {isActive && (
                <span className="sr-only">Active</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
