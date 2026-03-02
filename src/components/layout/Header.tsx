import { useState, useRef, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Role } from '../../types';
import { ChevronRight, Bell, UserCircle, ChevronDown, Check } from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  'Super Admin': 'Full system access',
  'Sub Store Keeper': 'Manage sub-store stock & GRN',
  'Centre In-Charge': 'Review & route PRs',
  'Central Store': 'Central stock & dispatch',
  'Procurement Officer': 'Source vendors & issue PO',
  'SMD': 'Executive approval authority',
  'Finance': 'Payment authorization',
};

const ALL_ROLES: Role[] = [
  'Super Admin', 'Sub Store Keeper', 'Centre In-Charge',
  'Central Store', 'Procurement Officer', 'SMD', 'Finance'
];

export const Header = () => {
  const { role, setRole, branch, setBranch, prs } = useProcurement();
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  const unreadCount = prs.filter(pr =>
    pr.slaDeadline < Date.now() && pr.status !== 'Closed - Completed'
  ).length;

  // Close role picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRolePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pickRole = (r: Role) => {
    setRole(r);
    setShowRolePicker(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center text-sm text-slate-500">
        <span className="hover:text-blue-600 cursor-pointer">Procurement</span>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="font-medium text-slate-900">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Branch selector */}
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <span className="text-xs font-medium text-slate-400 uppercase">Branch</span>
          <select
            value={branch}
            onChange={e => setBranch(e.target.value)}
            className="text-sm font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Bur Dubai">Bur Dubai</option>
            <option value="Al Quoz">Al Quoz</option>
          </select>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(v => !v); setShowRolePicker(false); }}
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {(unreadCount > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          {showNotifications && (
            <NotificationsPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Profile / Role Switcher */}
        <div className="relative pl-2" ref={roleRef}>
          <button
            onClick={() => { setShowRolePicker(v => !v); setShowNotifications(false); }}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-all group"
          >
            <UserCircle className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-700 leading-tight">Super Admin</span>
              <span className="text-xs text-slate-400 leading-tight flex items-center gap-1">
                {role} <ChevronDown className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* Role Dropdown */}
          {showRolePicker && (
            <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
              <div className="p-3 border-b border-slate-50 bg-slate-50/80">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Switch Active Role</p>
                <p className="text-[9px] text-slate-300 font-medium mt-0.5">Data and modules update instantly</p>
              </div>
              <div className="py-2">
                {ALL_ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => pickRole(r)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all hover:bg-blue-50/60 group ${role === r ? 'bg-blue-50' : ''}`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${role === r ? 'text-blue-700' : 'text-slate-700'}`}>{r}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{ROLE_DESCRIPTIONS[r]}</p>
                    </div>
                    {role === r && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
