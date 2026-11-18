import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, 
  Users, 
  CalendarDays, 
  Clock, 
  CreditCard, 
  BriefcaseBusiness, 
  Award,
  FileText,
  CalendarHeart,
  ShieldAlert,
  UserCircle,
  Settings
} from 'lucide-react';

export default function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'Employee';

  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: LayoutGrid, allowedRoles: ['Admin', 'HR', 'Manager', 'Employee'] },
    { path: '/attendance', label: 'Attendance', icon: CalendarDays, allowedRoles: ['Admin', 'HR', 'Manager', 'Employee'] },
    { path: '/recruitment', label: 'Recruitment', icon: BriefcaseBusiness, allowedRoles: ['Admin', 'HR', 'Employee'] },
    { path: '/leaves', label: 'Time Off & Leaves', icon: Clock, allowedRoles: ['Admin', 'HR', 'Manager', 'Employee'] },
    { path: '/holidays', label: 'Holidays', icon: CalendarHeart, allowedRoles: ['Admin', 'HR', 'Manager', 'Employee'] },
    { path: '/employees', label: 'Employees', icon: Users, allowedRoles: ['Admin', 'HR', 'Manager'] },
    { path: '/my-payslips', label: 'My Payslips', icon: FileText, allowedRoles: ['Employee'] },
    { path: '/payroll', label: 'Payroll', icon: CreditCard, allowedRoles: ['Admin', 'HR'] },
    { path: '/audit-logs', label: 'Audit Logs', icon: ShieldAlert, allowedRoles: ['Admin'] },
    { path: '/settings', label: 'System Settings', icon: Settings, allowedRoles: ['Admin'] },
    { path: '/profile', label: 'My Profile', icon: UserCircle, allowedRoles: ['Admin', 'HR', 'Manager', 'Employee'] },
  ];

  // Role-based navigation filtering (Employee will not see Payroll or Recruitment menus)
  const navItems = allNavItems.filter(item => item.allowedRoles.includes(role));

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
