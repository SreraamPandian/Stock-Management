import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Role } from '../../types';
import { ChevronRight, Bell, UserCircle } from 'lucide-react';

export const Header = () => {
  const { role, setRole, branch, setBranch } = useProcurement();

  const roles: Role[] = [
    'Sub Store Keeper', 'Centre In-Charge', 'Central Store', 
    'Procurement Officer', 'SMD', 'Finance'
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center text-sm text-slate-500">
        <span className="hover:text-blue-600 cursor-pointer">Procurement</span>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="font-medium text-slate-900">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <span className="text-xs font-medium text-slate-400 uppercase">Branch</span>
          <select 
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="text-sm font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Bur Dubai">Bur Dubai</option>
            <option value="Al Quoz">Al Quoz</option>
          </select>
        </div>

        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <span className="text-xs font-medium text-slate-400 uppercase">Simulate Role</span>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-2 pl-2 cursor-pointer">
          <UserCircle className="w-8 h-8 text-slate-300" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700 leading-tight">Admin User</span>
            <span className="text-xs text-slate-500 leading-tight">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
