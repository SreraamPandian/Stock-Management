import { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { PurchaseRequest } from '../../types';
import { PRDetailModal } from './PRDetailModal';
import { Plus, Filter, Clock, CheckCircle, MapPin, Search, LayoutGrid, List, AlertCircle } from 'lucide-react';
import { SLATimer } from '../shared/SLATimer';

export const Dashboard = () => {
  const { role, branch, prs, setActiveTab } = useProcurement();
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [search, setSearch] = useState('');

  const getRelevantPRs = () => {
    let filteredPrs = prs;
    if (role === 'Sub Store Keeper' || role === 'Centre In-Charge') {
      filteredPrs = prs.filter(pr => pr.branch === branch);
    }

    let roleFiltered = [];
    switch (role) {
      case 'Sub Store Keeper': roleFiltered = filteredPrs; break;
      case 'Centre In-Charge': roleFiltered = filteredPrs.filter(pr => pr.status === 'Pending - Centre In-Charge'); break;
      case 'Central Store': roleFiltered = filteredPrs.filter(pr => pr.status === 'Pending - Central Store'); break;
      case 'Procurement Officer': roleFiltered = filteredPrs.filter(pr => pr.status === 'Pending - Procurement'); break;
      case 'SMD': roleFiltered = filteredPrs.filter(pr => pr.status === 'Pending - SMD'); break;
      case 'Finance': roleFiltered = filteredPrs.filter(pr => pr.status === 'Pending - Finance'); break;
      default: roleFiltered = [];
    }

    if (search) {
      return roleFiltered.filter(pr =>
        pr.id.toLowerCase().includes(search.toLowerCase()) ||
        pr.department.toLowerCase().includes(search.toLowerCase()) ||
        pr.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    return roleFiltered;
  };

  const relevantPRs = getRelevantPRs();
  const breachedPRs = relevantPRs.filter(pr => pr.slaDeadline < Date.now() && pr.status !== 'Closed - Completed').length;
  const completedPRs = relevantPRs.filter(pr => pr.status === 'Closed - Completed').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            Operations Queue
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Active workflows for <span className="text-blue-600 font-bold">{role}</span>
            {(role === 'Sub Store Keeper' || role === 'Centre In-Charge') && (
              <span> @ <span className="text-blue-600 font-bold">{branch} Hub</span></span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search queue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-64 shadow-sm transition-all"
            />
          </div>
          {role === 'Sub Store Keeper' && (
            <button
              onClick={() => setActiveTab('PR Entry')}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-xs uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> Raise Requirement
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Requirements', val: relevantPRs.filter(pr => pr.status !== 'Closed - Completed').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'SLA Overdue', val: breachedPRs, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
          { label: 'Success (MTD)', val: completedPRs, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
        ].map((c, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border ${c.border} shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group cursor-default`}>
            <div className={`p-4 rounded-2xl ${c.bg} ${c.color} group-hover:scale-110 transition-transform`}><c.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
              <p className={`text-3xl font-black mt-0.5 ${c.color}`}>{c.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <List className="w-4 h-4" /> Priority Task List
          </h2>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">LIVE FEED</span>
          </div>
        </div>

        {relevantPRs.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <p className="text-xl font-black text-slate-800 uppercase tracking-tight">Zero Pending Actions</p>
            <p className="text-slate-500 mt-2 font-medium">Your queue is currently empty. Direct hits and escalations will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-50">
                  <th className="p-5">Reference ID</th>
                  <th className="p-5">Node Origin</th>
                  <th className="p-5">Critically</th>
                  <th className="p-5">Current Status</th>
                  <th className="p-5 text-right">SLA Clock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {relevantPRs.map(pr => (
                  <tr
                    key={pr.id}
                    onClick={() => setSelectedPR(pr)}
                    className="hover:bg-blue-50/20 cursor-pointer transition-all group animate-in fade-in"
                  >
                    <td className="p-5">
                      <span className="font-black text-blue-600 group-hover:text-blue-700 transition-colors font-mono">{pr.id}</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{pr.category}</p>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" /> {pr.branch}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{pr.department}</p>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${pr.priority === 'Emergency' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          pr.priority === 'High' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                        {pr.priority}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${pr.status.includes('Pending') ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          pr.status.includes('Rejected') ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pr.status.includes('Pending') ? 'bg-amber-500' : pr.status.includes('Rejected') ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                        {pr.status}
                      </span>
                    </td>
                    <td className="p-5 text-right flex justify-end">
                      {pr.status !== 'Closed - Completed' ? <SLATimer deadline={pr.slaDeadline} /> : <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">DE-ACTIVATED</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPR && <PRDetailModal pr={selectedPR} onClose={() => setSelectedPR(null)} />}
    </div>
  );
};
