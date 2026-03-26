import { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Asset, AssetStatus, AssetCategory } from '../../types';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  MapPin, 
  Clock, 
  Wrench, 
  FileText, 
  AlertTriangle,
  ChevronRight,
  History,
  Activity,
  Calendar,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

export const AssetManagementView = () => {
  const { assets, role, registerAsset, logMaintenance, transferAsset, updateAssetStatus, branch } = useProcurement();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'All'>('All');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showManualReg, setShowManualReg] = useState(false);
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'Medical' as AssetCategory,
    serialNo: '',
    brandModel: '',
    floor: '',
    room: '',
    assignedTo: '',
    ppmSchedule: 'Quarterly' as const,
    isCalibrationRequired: false
  });

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) || 
                          asset.id.toLowerCase().includes(search.toLowerCase()) ||
                          asset.serialNo.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || asset.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Under Maintenance': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Down': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Disposed': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Asset Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Lifecycle tracking, maintenance scheduling & DHA compliance</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search assets, IDs, or SNs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-64 shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={() => setShowManualReg(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Register Asset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Assets', val: assets.length, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'PPM Due (7 Days)', val: assets.filter(a => a.nextServiceDue < Date.now() + 7 * 86400000).length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Critical Down', val: assets.filter(a => a.status === 'Down').length, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Audit Ready %', val: '98%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group cursor-default">
            <div className={`p-4 rounded-2xl ${c.bg} ${c.color} group-hover:scale-110 transition-transform shrink-0`}><c.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${c.color}`}>{c.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Asset List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Active Asset Registry
              </h2>
              <div className="flex gap-2">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Medical">Medical</option>
                  <option value="IT">IT</option>
                  <option value="Furniture">Furniture</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="p-5 text-center w-12">#</th>
                    <th className="p-5">Asset Info</th>
                    <th className="p-5">Location</th>
                    <th className="p-5 text-center">Condition</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAssets.map((asset, index) => (
                    <tr 
                      key={asset.id} 
                      onClick={() => setSelectedAsset(asset)}
                      className="hover:bg-blue-50/30 cursor-pointer transition-all group"
                    >
                      <td className="p-5 text-center text-xs font-bold text-slate-400">{index + 1}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${asset.category === 'Medical' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            {asset.category === 'Medical' ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{asset.name}</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{asset.id} • SN: {asset.serialNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" /> {asset.branch}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{asset.floor} • {asset.room}</p>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${asset.condition === 'Good' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {asset.condition}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Panel - Maintenance & Detail */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Maintenance Alerts
              </h3>
              <div className="space-y-4">
                {assets.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className="w-1.5 h-10 rounded-full bg-blue-500 shrink-0"></div>
                    <div>
                      <p className="text-[11px] font-black text-slate-100 uppercase">{a.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">Next PPM: {format(a.nextServiceDue, 'dd MMM yyyy')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          {Math.ceil((a.nextServiceDue - Date.now()) / 86400000)} Days Remaining
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all duration-700"></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500" /> Recent Asset Movement
            </h3>
            <div className="space-y-6">
              {[
                { name: 'X-Ray Machine', from: 'Room 201', to: 'Diagnostic', user: 'Admin' },
                { name: 'Patient Monitor', from: 'Store B', to: 'ICU-Room 1', user: 'Tech' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1.5 h-10 rounded-full bg-slate-100 shrink-0"></div>
                  <div>
                    <p className="text-[11px] font-black text-slate-700 uppercase">{log.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{log.from} → {log.to}</p>
                    <p className="text-[9px] text-blue-500 font-black mt-1 uppercase tracking-tighter">Moved by {log.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal Overlay would go here */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex h-[80vh]">
            {/* Left: Stats & Identification */}
            <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col space-y-6">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{selectedAsset.name}</h2>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{selectedAsset.id}</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className={`p-4 rounded-2xl border ${getStatusColor(selectedAsset.status)}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Current Status</p>
                  <p className="text-base font-black">{selectedAsset.status}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Location Context</p>
                  <p className="text-sm font-bold text-slate-700">{selectedAsset.branch}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedAsset.floor} · {selectedAsset.room}</p>
                </div>
              </div>
              
              <div className="mt-auto space-y-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">System Fingerprint</p>
                <div className="flex justify-center gap-1">
                  <div className="w-1 h-3 bg-slate-200 rounded-full"></div>
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  <div className="w-1 h-2 bg-slate-200 rounded-full"></div>
                  <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Right: Detailed Tabs & Flow Blocks */}
            <div className="flex-1 p-8 overflow-y-auto space-y-10 bg-white">
              <div className="grid grid-cols-2 gap-8">
                {/* 1. Identification */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-900">1</span>
                    Asset Identification
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Category</p>
                      <p className="text-xs font-black text-slate-800">{selectedAsset.category}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Serial No</p>
                      <p className="text-xs font-black text-slate-800">{selectedAsset.serialNo}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Brand / Model</p>
                      <p className="text-xs font-black text-slate-800">{selectedAsset.brandModel}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Procurement & Warranty */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-900">2</span>
                    Procurement & Warranty
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Warranty End</p>
                      <p className="text-xs font-black text-rose-600">{selectedAsset.warrantyEnd}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Original Price</p>
                      <p className="text-xs font-black text-slate-800">AED {selectedAsset.price.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Vendor</p>
                      <p className="text-xs font-black text-slate-800">{selectedAsset.vendor}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Ownership & Assignment */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-900">3</span>
                    Ownership & Assignment
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-blue-400 uppercase">Assigned To</p>
                        <p className="text-sm font-black text-blue-900">{selectedAsset.assignedTo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-blue-400 uppercase text-right">Dept</p>
                        <p className="text-xs font-bold text-blue-700">{selectedAsset.department}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Maintenance & Compliance */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-900">6</span>
                    Maintenance & Compliance
                  </h4>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">PPM Schedule: {selectedAsset.ppmSchedule}</span>
                       <Wrench className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex justify-between">
                      <div className="text-center bg-white px-3 py-2 rounded-xl border border-amber-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Last Service</p>
                        <p className="text-[10px] font-bold text-slate-700">None</p>
                      </div>
                      <div className="text-center bg-white px-3 py-2 rounded-xl border border-amber-500 shadow-lg shadow-amber-100">
                        <p className="text-[8px] font-black text-amber-400 uppercase">Next Due</p>
                        <p className="text-[10px] font-black text-amber-600 font-mono italic">{format(selectedAsset.nextServiceDue, 'dd MMM yy')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        logMaintenance(selectedAsset.id, 'Routine check performed by operator');
                        alert('Maintenance Record Logged Successfully');
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Log Maintenance
                    </button>
                    <button 
                      onClick={() => {
                        const newRoom = prompt('Enter Destination Room:', selectedAsset.room);
                        if (newRoom) {
                          transferAsset(selectedAsset.id, selectedAsset.floor, newRoom);
                          alert(`Asset transferred to Room ${newRoom}`);
                        }
                      }}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <History className="w-3.5 h-3.5" /> Transfer Asset
                    </button>
                 </div>
                 <button 
                   onClick={() => {
                     updateAssetStatus(selectedAsset.id, 'Down', 'Poor');
                     alert('Asset flagged as DOWN. Maintenance ticket created.');
                   }}
                   className="text-rose-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                 >
                   Report Breakdown
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Registration Modal */}
      {showManualReg && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-8 h-8 text-white" />
                  <h2 className="text-2xl font-black tracking-tight uppercase">Manual Asset Registry</h2>
                </div>
                <p className="opacity-80 text-sm font-medium">Capture details for items acquired outside the PR system</p>
              </div>
              <button onClick={() => setShowManualReg(false)} className="p-2 hover:bg-white/10 rounded-full text-white">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Asset Nomenclature (Name)</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50"
                    placeholder="e.g. Clinical Workstation Pro"
                    value={assetForm.name}
                    onChange={e => setAssetForm({...assetForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Asset Category</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-slate-50"
                    value={assetForm.category}
                    onChange={e => setAssetForm({...assetForm, category: e.target.value as any})}
                  >
                    <option>Medical</option>
                    <option>IT</option>
                    <option>Furniture</option>
                    <option>Facility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Serial Number</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-slate-50"
                    placeholder="SN-XXXX-XXXX"
                    value={assetForm.serialNo}
                    onChange={e => setAssetForm({...assetForm, serialNo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Floor Level</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-slate-50"
                    placeholder="e.g. 1st Floor"
                    value={assetForm.floor}
                    onChange={e => setAssetForm({...assetForm, floor: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Room / Zone</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-slate-50"
                    placeholder="e.g. Diagnostic-04"
                    value={assetForm.room}
                    onChange={e => setAssetForm({...assetForm, room: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setShowManualReg(false)} className="px-6 py-3 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-800 transition-colors">Cancel</button>
              <button
                disabled={!assetForm.name || !assetForm.serialNo}
                onClick={() => {
                  const newAsset: Asset = {
                    id: `AST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: assetForm.name,
                    category: assetForm.category,
                    serialNo: assetForm.serialNo,
                    brandModel: assetForm.brandModel || 'Manual Entry',
                    prId: 'MANUAL',
                    purchaseDate: Date.now(),
                    price: 0,
                    vendor: 'Direct Entry',
                    warrantyStart: new Date().toISOString().split('T')[0],
                    warrantyEnd: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
                    ppmSchedule: assetForm.ppmSchedule,
                    nextServiceDue: Date.now() + 90 * 86400000,
                    isCalibrationRequired: assetForm.isCalibrationRequired,
                    department: 'General',
                    branch: branch,
                    assignedTo: assetForm.assignedTo || 'Facility Support',
                    issuedDate: Date.now(),
                    floor: assetForm.floor,
                    room: assetForm.room,
                    status: 'Active',
                    condition: 'Good',
                    movementHistory: [],
                    breakdownHistory: []
                  };
                  registerAsset(newAsset);
                  setShowManualReg(false);
                  setAssetForm({
                    name: '',
                    category: 'Medical',
                    serialNo: '',
                    brandModel: '',
                    floor: '',
                    room: '',
                    assignedTo: '',
                    ppmSchedule: 'Quarterly',
                    isCalibrationRequired: false
                  });
                  alert('Asset Manually Registered Successfully');
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all disabled:opacity-50"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
