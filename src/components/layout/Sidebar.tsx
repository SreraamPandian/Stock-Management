import { useState } from 'react';
import { LayoutDashboard, FileText, Package, BarChart2, Building2, Settings, ChevronDown, Store, Users } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import { Tab } from '../../types';

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useProcurement();
  const [masterOpen, setMasterOpen] = useState(
    activeTab === 'Store Management' || activeTab === 'User Management'
  );

  const mainNavItems: { icon: any; label: Tab }[] = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: FileText, label: 'PR Entry' },
    { icon: Package, label: 'Stock' },
    { icon: BarChart2, label: 'Analytics' },
    { icon: Settings, label: 'Admin' },
  ];

  const masterItems: { icon: any; label: Tab }[] = [
    { icon: Store, label: 'Store Management' },
    { icon: Users, label: 'User Management' },
  ];

  const isMasterActive = activeTab === 'Store Management' || activeTab === 'User Management';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
          <Building2 className="w-6 h-6" />
          <span>Pro-Biz</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {/* Main nav */}
        {mainNavItems.map(item => (
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

        {/* ── MASTER MODULE ── */}
        <div className="pt-2">
          <button
            onClick={() => setMasterOpen(v => !v)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isMasterActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${isMasterActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Master</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${masterOpen ? 'rotate-180' : ''} ${isMasterActive ? 'text-blue-500' : 'text-slate-300'}`} />
          </button>

          {masterOpen && (
            <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-slate-100 pl-3 animate-in slide-in-from-top-1 duration-150">
              {masterItems.map(item => (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.label
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <item.icon className={`w-4 h-4 ${activeTab === item.label ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">System Status</p>
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Operational
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('probiz_logged_in');
            window.location.reload();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-200 transition-all text-xs font-black uppercase tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
};
