import { useState } from 'react';
import { ProcurementProvider, useProcurement } from './context/ProcurementContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { NewPRForm } from './components/forms/NewPRForm';
import { StockView } from './components/views/StockView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AdminView } from './components/views/AdminView';
import { StoreManagementView } from './components/views/StoreManagementView';
import { UserManagementView } from './components/views/UserManagementView';
import { LoginPage } from './components/auth/LoginPage';
import { ApprovalQueueView } from './components/views/ApprovalQueueView';
import { PurchaseOrderView } from './components/views/PurchaseOrderView';

const AppContent = () => {
  const { activeTab, setActiveTab, role } = useProcurement();

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'PR Entry':
        if (role === 'SMD' || role === 'Finance') {
          return <ApprovalQueueView />;
        }
        return (
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Purchase Request Initiation</h1>
                <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Official Sourcing &amp; Inventory Procurement System
                </p>
              </div>
              <button
                onClick={() => setActiveTab('Dashboard')}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                &larr; Dashboard
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <NewPRForm onClose={() => setActiveTab('Dashboard')} />
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Procurement Policy</h3>
                    <ul className="space-y-4">
                      {[
                        'All requests are subject to approval hierarchies.',
                        'Priority level determines internal TAT and SLA deadlines.',
                        'Barcode scanning is mandatory for available stock.',
                        'Financial authorization required for all non-stock items.'
                      ].map((p, i) => (
                        <li key={i} className="flex gap-3 text-xs leading-relaxed text-slate-300 font-medium">
                          <span className="text-blue-400 font-black">0{i + 1}.</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2">Recent Activity</h3>
                  <div className="space-y-6">
                    {useProcurement().prs.slice(0, 3).map((pr, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-1.5 h-10 rounded-full bg-slate-100 shrink-0"></div>
                        <div>
                          <p className="text-[11px] font-black text-slate-700 uppercase">{pr.id}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{pr.category}</p>
                          <p className="text-[9px] text-blue-500 font-black mt-1 uppercase tracking-tighter">{pr.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Stock':
        return <StockView />;
      case 'Analytics':
        return <AnalyticsView />;
      case 'Admin':
        return <AdminView />;
      case 'Store Management':
        return <StoreManagementView />;
      case 'User Management':
        return <UserManagementView />;
      case 'Purchase Order':
        return <PurchaseOrderView />;
      case 'Finance Queue' as any:
        return <ApprovalQueueView viewAsRole="Finance" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return !!localStorage.getItem('probiz_logged_in');
  });

  const handleLogin = (role: string, _name: string) => {
    localStorage.setItem('probiz_logged_in', 'true');
    localStorage.setItem('procurement_role', role);
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ProcurementProvider>
      <AppContent />
    </ProcurementProvider>
  );
}

export default App;
