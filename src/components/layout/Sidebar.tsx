import React from 'react';
import { LayoutDashboard, FileText, Package, BarChart2, Building2, Settings } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import { Tab } from '../../types';

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useProcurement();

  const navItems: { icon: any, label: Tab }[] = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: FileText, label: 'PR Entry' },
    { icon: Package, label: 'Stock' },
    { icon: BarChart2, label: 'Analytics' },
    { icon: Settings, label: 'Admin' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
          <Building2 className="w-6 h-6" />
          <span>Pro-Biz</span>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.label
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.label ? 'text-blue-600' : 'text-slate-400'}`} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">System Status</p>
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Operational
          </div>
        </div>
      </div>
    </aside>
  );
};
