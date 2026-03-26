import { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Asset, AssetStatus, AssetCategory, AssetCondition } from '../../types';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  MapPin, 
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
  const { 
    assets, role, registerAsset, logMaintenance, 
    transferAsset, updateAssetStatus, branch,
    branches, departments, brands, categories, users 
  } = useProcurement();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'All'>('All');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showManualReg, setShowManualReg] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const initialFormState = {
    // Step 1: Identification
    id: '', tagNumber: '', name: '', brandModel: '', category: 'Medical' as AssetCategory, 
    type: 'Medical', serialNo: '', manufacturerRef: '',
    
    // Step 2: Procurement & Warranty
    purchaseDate: format(new Date(), 'yyyy-MM-dd'), invoiceRef: '',
    warrantyStart: format(new Date(), 'yyyy-MM-dd'), startDate: format(new Date(), 'yyyy-MM-dd'),
    warrantyEnd: format(new Date(Date.now() + 365 * 86400000), 'yyyy-MM-dd'),
    alertBeforeExpiry: 30,
    
    // Step 3: Ownership & Assignment
    assetOwner: '', department: '', branch: '', assignedTo: '', issuedDate: format(new Date(), 'yyyy-MM-dd'),
    issuedBy: role, returnDate: '',
    
    // Step 4: Location
    floor: '', buildingWing: '', room: '', exactLocation: '', rackCorner: '',
    
    // Step 5: Status & Condition
    status: 'Active' as AssetStatus,
    condition: 'Good' as AssetCondition,
    
    // Step 6: Maintenance & Compliance
    dhaAuditFocus: false,
    ppmSchedule: 'Quarterly' as 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual',
    lastServiceDate: '',
    nextServiceDue: '',
    isCalibrationRequired: false,
    amcVendor: '',
    serviceProvider: '',
    
    documentUrl: ''
  };

  const [assetForm, setAssetForm] = useState(initialFormState);

  const generateIdentifiers = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const tag = Math.floor(100000 + Math.random() * 900000);
    setAssetForm(prev => ({
      ...prev,
      id: `AST-${year}-${random}`,
      tagNumber: `TAG-${tag}`
    }));
  };

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
            onClick={() => {
              generateIdentifiers();
              setShowManualReg(true);
            }}
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

      <div className="grid grid-cols-1 gap-8 items-start">
        {/* Main Asset List */}
        <div className="space-y-6">
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
                          <MapPin className="w-3.5 h-3.5 text-blue-400" /> {asset.assetOwner}
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
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Issued Date</p>
                       <p className="text-xs font-black text-slate-800">{format(selectedAsset.issuedDate, 'dd MMM yyyy')}</p>
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
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded ${selectedAsset.dhaAuditFocus ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-800'} uppercase tracking-widest`}>
                        {selectedAsset.dhaAuditFocus ? 'DHA AUDIT FOCUS' : `PPM: ${selectedAsset.ppmSchedule}`}
                       </span>
                       <Wrench className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="text-center bg-white px-3 py-2 rounded-xl border border-amber-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Last Service</p>
                        <p className="text-[10px] font-bold text-slate-700">{selectedAsset.lastServiceDate ? format(selectedAsset.lastServiceDate, 'dd MMM yy') : 'N/A'}</p>
                      </div>
                      <div className="text-center bg-white px-3 py-2 rounded-xl border border-amber-500 shadow-lg shadow-amber-100">
                        <p className="text-[8px] font-black text-amber-400 uppercase">Next Due</p>
                        <p className="text-[10px] font-black text-amber-600 font-mono italic">{format(selectedAsset.nextServiceDue, 'dd MMM yy')}</p>
                      </div>
                    </div>
                    {selectedAsset.isCalibrationRequired && (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-emerald-100 flex justify-between items-center">
                        <span className="text-[9px] font-black text-emerald-600 uppercase">Calibration Required</span>
                        <Zap className="w-3 h-3 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* History Tabs Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-500" />
                  Asset Lifecycle History
                </h4>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Movement History */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[150px]">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Movement</p>
                    <div className="space-y-3">
                      {selectedAsset.movementLogs.length > 0 ? selectedAsset.movementLogs.map(log => (
                        <div key={log.id} className="text-[10px] border-l-2 border-blue-400 pl-2 py-1">
                          <p className="font-black text-slate-700">{log.fromLocation} → {log.toLocation}</p>
                          <p className="text-slate-400">{format(log.date, 'dd MMM yy')} • {log.movedBy}</p>
                        </div>
                      )) : (
                        <p className="text-[10px] text-slate-400 italic">No movement history recorded.</p>
                      )}
                    </div>
                  </div>

                  {/* Service History */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[150px]">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Service & Compliance</p>
                    <div className="space-y-3">
                      {selectedAsset.maintenanceLogs.length > 0 ? selectedAsset.maintenanceLogs.map(log => (
                        <div key={log.id} className="text-[10px] border-l-2 border-emerald-400 pl-2 py-1">
                          <p className="font-black text-slate-700">{log.type}: {log.notes}</p>
                          <p className="text-slate-400">{format(log.date, 'dd MMM yy')} • {log.performer}</p>
                        </div>
                      )) : (
                        <p className="text-[10px] text-slate-400 italic">No maintenance logs found.</p>
                      )}
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
          <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            {/* Header with Stepper */}
            <div className="p-8 bg-slate-900 text-white">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                    <h2 className="text-2xl font-black tracking-tight uppercase">Asset Registration Wizard</h2>
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Step {formStep} of 6 • {
                    formStep === 1 ? 'Asset Identification' :
                    formStep === 2 ? 'Procurement & Warranty' :
                    formStep === 3 ? 'Ownership & Assignment' :
                    formStep === 4 ? 'Location Details' : 
                    formStep === 5 ? 'Status & Condition' : 
                    'Maintenance & Compliance'
                  }</p>
                </div>
                <button 
                  onClick={() => { 
                    setShowManualReg(false); 
                    setFormStep(1); 
                    setAssetForm(initialFormState);
                  }} 
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              {/* Stepper Pulse */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      s <= formStep ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
              {/* STEP 1: ASSET IDENTIFICATION */}
              {formStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                        Asset ID <span className="text-blue-500 font-bold">Auto-Generated</span>
                      </label>
                      <input 
                        readOnly
                        value={assetForm.id}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                        Unique Tag Number <span className="text-blue-500 font-bold">Auto-Generated</span>
                      </label>
                      <input 
                        readOnly
                        value={assetForm.tagNumber}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asset Name *</label>
                      <input 
                        autoFocus
                        value={assetForm.name}
                        onChange={e => setAssetForm({...assetForm, name: e.target.value})}
                        placeholder="Enter logical name of the asset..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Brand / Model</label>
                      <select 
                        value={assetForm.brandModel}
                        onChange={e => setAssetForm({...assetForm, brandModel: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      >
                        <option value="">Select Brand</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                      <select 
                        value={assetForm.category}
                        onChange={e => setAssetForm({...assetForm, category: e.target.value as any})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Serial Number *</label>
                      <input 
                        value={assetForm.serialNo}
                        onChange={e => setAssetForm({...assetForm, serialNo: e.target.value})}
                        placeholder="SN-XXXX-XXXX"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Manufacturer Ref.</label>
                      <input 
                        value={assetForm.manufacturerRef}
                        onChange={e => setAssetForm({...assetForm, manufacturerRef: e.target.value})}
                        placeholder="Ref code..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PROCUREMENT & WARRANTY */}
              {formStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Purchase Date</label>
                      <input 
                        type="date"
                        value={assetForm.purchaseDate}
                        onChange={e => setAssetForm({...assetForm, purchaseDate: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Invoice Reference</label>
                      <input 
                        value={assetForm.invoiceRef}
                        onChange={e => setAssetForm({...assetForm, invoiceRef: e.target.value})}
                        placeholder="INV-XXXX"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Document Upload (Invoice/Manual)</label>
                      <div className="relative">
                        <input 
                          value={assetForm.documentUrl}
                          onChange={e => setAssetForm({...assetForm, documentUrl: e.target.value})}
                          placeholder="Drop file or paste URL..."
                          className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-inner bg-slate-50 outline-none pr-10"
                        />
                        <FileText className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Warranty Start Date</label>
                      <input 
                        type="date"
                        value={assetForm.warrantyStart}
                        onChange={e => setAssetForm({...assetForm, warrantyStart: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Warranty End Date</label>
                      <input 
                        type="date"
                        value={assetForm.warrantyEnd}
                        onChange={e => setAssetForm({...assetForm, warrantyEnd: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Alert Before Expiry (Days)</label>
                      <select 
                        value={assetForm.alertBeforeExpiry}
                        onChange={e => setAssetForm({...assetForm, alertBeforeExpiry: Number(e.target.value)})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      >
                        <option value={15}>15 Days</option>
                        <option value={30}>30 Days</option>
                        <option value={60}>60 Days</option>
                        <option value={90}>90 Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: OWNERSHIP & ASSIGNMENT */}
              {formStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asset Center / Branch *</label>
                      <select 
                        value={assetForm.branch}
                        onChange={e => setAssetForm({...assetForm, branch: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      >
                        <option value="">Select Center</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asset Owner (Dept / center)</label>
                      <input 
                        value={assetForm.assetOwner}
                        onChange={e => setAssetForm({...assetForm, assetOwner: e.target.value})}
                        placeholder="Main Admin / Diagnostics..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department / Section</label>
                      <select 
                        value={assetForm.department}
                        onChange={e => setAssetForm({...assetForm, department: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assigned To</label>
                      <select 
                        value={assetForm.assignedTo}
                        onChange={e => setAssetForm({...assetForm, assignedTo: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      >
                        <option value="">Select User</option>
                        {users.map(u => (
                          <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Issued Date</label>
                      <input 
                        type="date"
                        value={assetForm.issuedDate}
                        onChange={e => setAssetForm({...assetForm, issuedDate: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assigned By</label>
                      <input 
                        value={assetForm.issuedBy}
                        readOnly
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: LOCATION DETAILS */}
              {formStep === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Floor</label>
                      <input 
                        value={assetForm.floor}
                        onChange={e => setAssetForm({...assetForm, floor: e.target.value})}
                        placeholder="e.g. Ground / 1st"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Building / Wing</label>
                      <input 
                        value={assetForm.buildingWing}
                        onChange={e => setAssetForm({...assetForm, buildingWing: e.target.value})}
                        placeholder="e.g. Main / East Wing"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Room Name / Number</label>
                      <input 
                        value={assetForm.room}
                        onChange={e => setAssetForm({...assetForm, room: e.target.value})}
                        placeholder="e.g. ICU-402"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Exact Location</label>
                      <input 
                        value={assetForm.exactLocation}
                        onChange={e => setAssetForm({...assetForm, exactLocation: e.target.value})}
                        placeholder="e.g. Near window"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rack / Corner (Optional)</label>
                      <input 
                        value={assetForm.rackCorner}
                        onChange={e => setAssetForm({...assetForm, rackCorner: e.target.value})}
                        placeholder="e.g. Shelf B"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: STATUS & CONDITION */}
              {formStep === 5 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Initial Status</label>
                      <select 
                        value={assetForm.status}
                        onChange={e => setAssetForm({...assetForm, status: e.target.value as any})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Down">Down</option>
                        <option value="Disposed">Disposed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Equipment Condition</label>
                      <select 
                        value={assetForm.condition}
                        onChange={e => setAssetForm({...assetForm, condition: e.target.value as any})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      >
                        <option value="Good">Good (Full working order)</option>
                        <option value="Fair">Fair (Operational but aging)</option>
                        <option value="Poor">Poor (Major repair needed)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: MAINTENANCE & COMPLIANCE */}
              {formStep === 6 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={assetForm.dhaAuditFocus}
                            onChange={e => setAssetForm({...assetForm, dhaAuditFocus: e.target.checked})}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-black text-slate-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">DHA Audit Focus Item</span>
                       </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">PPM Schedule</label>
                      <select 
                        value={assetForm.ppmSchedule}
                        onChange={e => setAssetForm({...assetForm, ppmSchedule: e.target.value as any})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none bg-white"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Bi-Annual">Bi-Annual</option>
                        <option value="Annual">Annual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Service Date</label>
                      <input 
                        type="date"
                        value={assetForm.lastServiceDate || ''}
                        onChange={e => setAssetForm({...assetForm, lastServiceDate: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Next PPM Due (Override)</label>
                      <input 
                        type="date"
                        value={assetForm.nextServiceDue}
                        onChange={e => setAssetForm({...assetForm, nextServiceDue: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                       <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={assetForm.isCalibrationRequired}
                            onChange={e => setAssetForm({...assetForm, isCalibrationRequired: e.target.checked})}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-black text-slate-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">Calibration Required</span>
                       </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">AMC / Vendor</label>
                      <input 
                        value={assetForm.amcVendor}
                        onChange={e => setAssetForm({...assetForm, amcVendor: e.target.value})}
                        placeholder="AMC Provider..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Service Provider</label>
                      <input 
                        value={assetForm.serviceProvider}
                        onChange={e => setAssetForm({...assetForm, serviceProvider: e.target.value})}
                        placeholder="Contact Person..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <button 
                onClick={() => {
                  setShowManualReg(false);
                  setFormStep(1);
                  setAssetForm(initialFormState);
                }}
                className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Cancel Entry
              </button>
              
              <div className="flex gap-3">
                {formStep > 1 && (
                  <button 
                    onClick={() => setFormStep(formStep - 1)}
                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                  >
                    Back
                  </button>
                )}
                
                {formStep < 6 ? (
                  <button 
                    onClick={() => {
                      setFormStep(formStep + 1);
                    }}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl shadow-slate-200 transition-all disabled:opacity-50"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      const newAsset: Asset = {
                        ...assetForm,
                        id: assetForm.id,
                        tagNumber: assetForm.tagNumber,
                        purchaseDate: assetForm.purchaseDate ? new Date(assetForm.purchaseDate).getTime() : Date.now(),
                        issuedDate: assetForm.issuedDate ? new Date(assetForm.issuedDate).getTime() : Date.now(),
                        warrantyStart: assetForm.warrantyStart,
                        warrantyEnd: assetForm.warrantyEnd,
                        lastServiceDate: assetForm.lastServiceDate ? new Date(assetForm.lastServiceDate).getTime() : undefined,
                        nextServiceDue: assetForm.nextServiceDue ? new Date(assetForm.nextServiceDue).getTime() : Date.now() + 90 * 86400000,
                        maintenanceLogs: assetForm.lastServiceDate ? [{
                          id: `LOG-${Date.now()}`,
                          date: new Date(assetForm.lastServiceDate).getTime(),
                          type: 'PPM',
                          performer: assetForm.serviceProvider || 'System',
                          notes: 'Initial recorded service at registration',
                          status: 'Pass'
                        }] : [],
                        movementLogs: [{
                          id: `MOV-${Date.now()}`,
                          date: Date.now(),
                          fromLocation: 'Registry',
                          toLocation: `${assetForm.branch || branch} - ${assetForm.room || 'Storage'}`,
                          movedBy: role,
                          reason: 'Initial Asset Assignment'
                        }],
                        branch: assetForm.branch || branch // Fallback to current branch
                      } as any;
                      registerAsset(newAsset);
                      setShowManualReg(false);
                      setFormStep(1);
                      setAssetForm(initialFormState);
                      alert('Asset Registered Successfully');
                    }}
                    className="px-10 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all"
                  >
                    Complete Registration
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
