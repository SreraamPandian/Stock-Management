import React, { useState } from 'react';
import { FileDown, Search, Filter, PieChart, BarChart2, TrendingUp, ShieldCheck, Activity, DollarSign, ChevronRight, ChevronDown, Clock, MapPin } from 'lucide-react';
import { useProcurement } from '../../../context/ProcurementContext';
import { format } from 'date-fns';
import { AssetCategory, AssetStatus } from '../../../types';

export const AssetReportsView = () => {
  const { assets, branches } = useProcurement();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<AssetStatus | 'All'>('All');
  const [filterBranch, setFilterBranch] = useState<string>('All');
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  const filteredAssets = assets.filter((a: any) => {
    const matchesSearch = (a.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
                          (a.id?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (a.serialNo?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    const matchesBranch = filterBranch === 'All' || a.branch === filterBranch;
    return matchesSearch && matchesCategory && matchesStatus && matchesBranch;
  });

  const totalValue = filteredAssets.reduce((sum: number, a: any) => sum + (a.price || 0), 0);
  const auditReadyCount = filteredAssets.filter((a: any) => a.nextServiceDue > Date.now()).length;

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Status', 'Condition', 'Branch', 'Assigned To', 'Value', 'Next PPM'];
    const rows = filteredAssets.map((a: any) => [
      a.id,
      a.name,
      a.category,
      a.status,
      a.condition,
      a.branch,
      a.assignedTo,
      `AED ${(a.price || 0).toLocaleString()}`,
      a.nextServiceDue ? format(new Date(a.nextServiceDue), 'dd MMM yyyy') : 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `asset_report_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ── HEADER ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PieChart className="w-8 h-8 text-indigo-600" /> Asset Intelligence
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Filter, analyze and export comprehensive asset registry data</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
        >
          <FileDown className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* ── KPI MINI CARDS ── */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Reported Assets', val: filteredAssets.length, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Filtered Valuation', val: `AED ${totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Audit Compliance', val: `${Math.round((auditReadyCount / (filteredAssets.length || 1)) * 100)}%`, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Condition', val: 'Good', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((k, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${k.bg} ${k.color}`}><k.icon className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
              <p className="text-xl font-black text-slate-900">{k.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Search Registry</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Name, ID, Serial No..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          
          <div className="w-48">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
            <select 
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Medical">Medical</option>
              <option value="IT">IT</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>

          <div className="w-48">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Down">Down</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>

          <div className="w-48">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Branch / Center</label>
            <select 
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer"
            >
              <option value="All">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => { setSearch(''); setFilterCategory('All'); setFilterStatus('All'); setFilterBranch('All'); }}
            className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors"
            title="Reset Filters"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* ── TABLE ── */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="p-4">Asset Identification</th>
                <th className="p-4">Category</th>
                <th className="p-4">Physical Location</th>
                <th className="p-4">Assigned To</th>
                <th className="p-4">Financials</th>
                <th className="p-4">Status</th>
                <th className="p-1"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssets.length > 0 ? filteredAssets.map((a) => (
                <React.Fragment key={a.id}>
                  <tr className="hover:bg-indigo-50/30 transition-all cursor-default group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{a.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{a.id} • SN: {a.serialNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {a.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-black text-slate-700">{a.branch}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{a.floor} • {a.room}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-bold text-slate-700">{a.assignedTo || 'Unassigned'}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{a.department}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-black text-slate-800">AED {(a.price || 0).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase">Wart: {a.warrantyEnd ? format(new Date(a.warrantyEnd), 'MMM yyyy') : 'N/A'}</p>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => setExpandedAsset(expandedAsset === a.id ? null : a.id)}
                      className={`p-2 rounded-lg transition-colors ${expandedAsset === a.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      {expandedAsset === a.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
                {expandedAsset === a.id && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={7} className="p-8 border-b border-indigo-100">
                      <div className="grid grid-cols-2 gap-12">
                        {/* Maintenance History */}
                         <div className="space-y-4">
                          <div className="space-y-3">
                             {(a.maintenanceLogs && a.maintenanceLogs.length > 0) ? a.maintenanceLogs.map((log: any, i: number) => (
                               <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                                 <div>
                                   <p className="text-[11px] font-black text-slate-800">{log.type} Service</p>
                                   <p className="text-[10px] text-slate-500">{log.notes}</p>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                                     {format(new Date(log.date), 'dd MMM yyyy')} • {log.performer}
                                   </p>
                                 </div>
                                 <span className={`text-[9px] font-black px-2 py-0.5 rounded ${log.status === 'Pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                   {log.status}
                                 </span>
                               </div>
                             )) : (
                               <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                  <p className="text-[11px] font-black text-slate-800 italic">Pre-Audit System Initialization</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                                    {format(new Date(a.purchaseDate || Date.now()), 'dd MMM yyyy')} • Auto-Generated
                                  </p>
                               </div>
                             )}
                          </div>
                        </div>

                        {/* Movement History */}
                         <div className="space-y-4">
                          <div className="space-y-3">
                             {(a.movementLogs && a.movementLogs.length > 0) ? a.movementLogs.map((mov: any, i: number) => (
                               <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-700">
                                    <span>{mov.fromLocation}</span>
                                    <ChevronRight className="w-3 h-3 text-slate-300" />
                                    <span className="text-emerald-600">{mov.toLocation}</span>
                                 </div>
                                 <p className="text-[10px] text-slate-500 mt-1">{mov.reason}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                                   {format(new Date(mov.date), 'dd MMM yyyy')} • {mov.movedBy}
                                 </p>
                               </div>
                             )) : (
                               <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                  <p className="text-[11px] font-black text-slate-800 italic">Pre-Audit Location Lock</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                                    {format(new Date(a.purchaseDate || Date.now()), 'dd MMM yyyy')} • System Set
                                  </p>
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <BarChart2 className="w-12 h-12 text-slate-400" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No assets match your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
