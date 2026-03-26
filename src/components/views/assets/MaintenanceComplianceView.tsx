import { useProcurement } from '../../../context/ProcurementContext';
import { Wrench, AlertTriangle, Clock, ShieldCheck, Search, Filter, Activity, History, MapPin, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export const MaintenanceComplianceView = () => {
  const { assets, updateAsset } = useProcurement() as any;
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Overdue' | 'Upcoming'>('All');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempAsset, setTempAsset] = useState<any>(null);

  const handleEdit = () => {
    setTempAsset({ ...selectedAsset });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateAsset(tempAsset);
    setSelectedAsset(tempAsset);
    setIsEditing(false);
  };

  const mntAssets = assets.filter(a => {
    const matchesSearch = (a.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (a.serialNo?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (a.id?.toLowerCase() || '').includes(search.toLowerCase());
    
    const isOverdue = (a.nextServiceDue || 0) < Date.now();
    const matchesFilter = filterType === 'All' ? true :
                         filterType === 'Overdue' ? isOverdue :
                         !isOverdue;
    
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Overdue PPM', val: assets.filter((a: any) => (a.nextServiceDue || 0) < Date.now() && a.nextServiceDue).length, color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertTriangle },
    { label: 'Upcoming (30d)', val: assets.filter((a: any) => a.nextServiceDue > Date.now() && a.nextServiceDue < Date.now() + (30 * 24 * 3600000)).length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    { label: 'DHA Audit Focus', val: assets.filter((a: any) => a.dhaAuditFocus).length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Activity },
    { label: 'Calibration Req.', val: assets.filter((a: any) => a.isCalibrationRequired).length, color: 'text-blue-600', bg: 'bg-blue-50', icon: ShieldCheck },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ── HEADER ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-600" /> Maintenance & Compliance
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track PPM schedules, calibration status, and equipment uptime</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search equipment..."
              className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white w-48 shadow-sm"
            />
          </div>
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none py-1.5 cursor-pointer"
            >
              <option value="All">All Items</option>
              <option value="Overdue">Overdue Only</option>
              <option value="Upcoming">Upcoming Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-default group">
            <div className={`p-3 rounded-xl ${s.bg} group-hover:scale-110 transition-transform`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-slate-900">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="grid grid-cols-3 gap-8">
        {/* Maintenance Queue */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 bg-white flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Maintenance Schedule
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-50 bg-slate-50/50">
                  <th className="p-4">Equipment</th>
                  <th className="p-4">Frequency</th>
                  <th className="p-4">Last Service</th>
                  <th className="p-4">Next Due</th>
                  <th className="p-4">Audit Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium">
                {mntAssets.map((a: any) => {
                  const isOverdue = a.nextServiceDue < Date.now();
                  return (
                    <tr 
                      key={a.id} 
                      onClick={() => setSelectedAsset(a)}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <td className="p-4">
                        <p className="font-black text-slate-800 tracking-tight">{a.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{a.id} • SN: {a.serialNo}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded border border-blue-100 uppercase tracking-widest">
                          {a.ppmSchedule}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 font-bold">
                        {a.lastServiceDate ? format(new Date(a.lastServiceDate), 'dd MMM yyyy') : 'No History'}
                      </td>
                      <td className="p-4">
                        <p className={`text-xs font-black ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                          {a.nextServiceDue ? format(new Date(a.nextServiceDue), 'dd MMM yyyy') : 'No Date'}
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">
                          {isOverdue ? 'Overdue' : a.nextServiceDue ? `${Math.ceil((a.nextServiceDue - Date.now()) / (24 * 3600000))} Days Left` : 'N/A'}
                        </p>
                      </td>
                      <td className="p-4">
                        {a.dhaAuditFocus ? (
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-600 uppercase bg-rose-50 px-2 py-1 rounded border border-rose-100 w-fit">
                            <Activity className="w-3 h-3" /> Focus
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-300 uppercase italic">Standard</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Guard / Alerts */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compliance Scoring
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-black text-emerald-400 tracking-tighter">94%</div>
              <div className="text-[10px] font-black text-slate-400 uppercase leading-tight tracking-widest">Overall Facility <br />Uptime Score</div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Medical Calibration', score: '88%', status: 'Warning' },
                { label: 'Asset Documentation', score: '95%', status: 'Perfect' },
                { label: 'HVAC Maintenance', score: '92%', status: 'Good' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-white/10 last:border-0 font-bold">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-black text-white">{item.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              Latest Service Logs
              <Activity className="w-3 h-3 text-blue-500" />
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {assets.some(a => (a.maintenanceLogs?.length || 0) > 0) && assets.flatMap(a => 
                (a.maintenanceLogs || []).map(log => ({ ...log, assetName: a.name }))
              ).sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 5).map((log, i) => (
                <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                  {i < 4 && <div className="absolute left-[3px] top-4 w-[1px] h-full bg-slate-100" />}
                  <div className={`w-1.5 h-1.5 rounded-full z-10 mt-1.5 shrink-0 ${log.type === 'PPM' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="text-[11px] font-black text-slate-800 leading-tight">{log.assetName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{log.notes}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                      {log.date ? format(new Date(log.date), 'dd MMM yyyy') : 'N/A'} • {log.performer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-start">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center border border-blue-500/30">
                  <ShieldCheck className="w-10 h-10 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black tracking-tight uppercase">{selectedAsset.name}</h2>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-black border border-emerald-500/30 uppercase tracking-widest">{selectedAsset.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedAsset.id} • {selectedAsset.category}</p>
                  <p className="text-blue-400 text-[10px] font-black uppercase mt-1 tracking-widest">SN: {selectedAsset.serialNo}</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                {!isEditing ? (
                  <button onClick={handleEdit} className="px-4 py-2 border border-blue-500 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/10 transition-all flex items-center gap-2">
                     Edit Details
                  </button>
                ) : (
                  <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2">
                     Confirm Changes
                  </button>
                )}
                <button onClick={() => { setSelectedAsset(null); setIsEditing(false); }} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 grid grid-cols-3 gap-8 overflow-y-auto max-h-[70vh] custom-scrollbar bg-slate-50/30">
              <div className="col-span-2 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-blue-500" /> Technical & Compliance Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">PPM Schedule</p>
                      {isEditing ? (
                        <select 
                          value={tempAsset.ppmSchedule}
                          onChange={e => setTempAsset({...tempAsset, ppmSchedule: e.target.value})}
                          className="w-full text-xs font-black text-slate-700 outline-none border-b border-slate-100 pb-1"
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Bi-Annual">Bi-Annual</option>
                          <option value="Annual">Annual</option>
                        </select>
                      ) : (
                        <p className="text-xs font-black text-slate-700">{selectedAsset.ppmSchedule}</p>
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Calibration Required</p>
                      {isEditing ? (
                        <select 
                          value={tempAsset.isCalibrationRequired ? 'Yes' : 'No'}
                          onChange={e => setTempAsset({...tempAsset, isCalibrationRequired: e.target.value === 'Yes'})}
                          className="w-full text-xs font-black text-slate-700 outline-none border-b border-slate-100 pb-1"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <p className="text-xs font-black text-slate-700">{selectedAsset.isCalibrationRequired ? 'Yes' : 'No'}</p>
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Last Service</p>
                      {isEditing ? (
                        <input 
                          type="date"
                          value={tempAsset.lastServiceDate ? format(new Date(tempAsset.lastServiceDate), 'yyyy-MM-dd') : ''}
                          onChange={e => setTempAsset({...tempAsset, lastServiceDate: new Date(e.target.value).getTime()})}
                          className="w-full text-xs font-black text-slate-700 outline-none border-b border-slate-100 pb-1"
                        />
                      ) : (
                        <p className="text-xs font-black text-slate-700">{selectedAsset.lastServiceDate ? format(new Date(selectedAsset.lastServiceDate), 'dd MMM yyyy') : 'No History'}</p>
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Next PPM Due</p>
                      {isEditing ? (
                        <input 
                          type="date"
                          value={tempAsset.nextServiceDue ? format(new Date(tempAsset.nextServiceDue), 'yyyy-MM-dd') : ''}
                          onChange={e => setTempAsset({...tempAsset, nextServiceDue: new Date(e.target.value).getTime()})}
                          className="w-full text-xs font-black text-slate-700 outline-none border-b border-slate-100 pb-1"
                        />
                      ) : (
                        <p className={`text-xs font-black ${(selectedAsset.nextServiceDue || 0) < Date.now() ? 'text-rose-600' : 'text-slate-700'}`}>
                          {selectedAsset.nextServiceDue ? format(new Date(selectedAsset.nextServiceDue), 'dd MMM yyyy') : 'N/A'}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">AMC / Vendor Provider</p>
                      {isEditing ? (
                        <input 
                          value={tempAsset.vendor || ''}
                          onChange={e => setTempAsset({...tempAsset, vendor: e.target.value})}
                          placeholder="Vendor Name"
                          className="w-full text-xs font-black text-slate-700 outline-none border-b border-slate-100 pb-1"
                        />
                      ) : (
                        <p className="text-xs font-black text-slate-700">{selectedAsset.vendor || 'In-House'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-emerald-500" /> Movement History logs
                  </h4>
                  <div className="space-y-2">
                    {selectedAsset.movementLogs && selectedAsset.movementLogs.length > 0 ? selectedAsset.movementLogs.map((mov: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                             <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700">
                               <span>{mov.fromLocation}</span>
                               <ChevronRight className="w-3 h-3 text-slate-300" />
                               <span className="text-emerald-600">{mov.toLocation}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{mov.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-800">{format(new Date(mov.date), 'dd MMM yy')}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{mov.movedBy}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-[10px] text-slate-400 italic">No movement history recorded.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Location Details</h4>
                   <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                     <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase">Building / Wing</p>
                       <p className="text-[11px] font-bold text-slate-800">{selectedAsset.buildingWing || 'Main Wing'}</p>
                     </div>
                     <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase">Floor & Room</p>
                       <p className="text-[11px] font-bold text-slate-800">{selectedAsset.floor} • {selectedAsset.room}</p>
                     </div>
                     <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase">Department</p>
                       <p className="text-[11px] font-bold text-slate-800">{selectedAsset.department}</p>
                     </div>
                   </div>
                 </div>

                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Service Audit Trail</h4>
                    <div className="space-y-2">
                       {selectedAsset.maintenanceLogs && selectedAsset.maintenanceLogs.length > 0 ? selectedAsset.maintenanceLogs.slice(0, 3).map((log: any, idx: number) => (
                         <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-800">{log.type} Service</p>
                            <p className="text-[9px] text-slate-500 line-clamp-1">{log.notes}</p>
                            <div className="mt-1 flex justify-between items-center">
                               <span className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">{log.status}</span>
                               <span className="text-[8px] text-slate-400 font-bold uppercase">{format(new Date(log.date), 'dd MMM yy')}</span>
                            </div>
                         </div>
                       )) : (
                         <p className="text-[10px] text-slate-400 italic">No service history.</p>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
