import { BarChart2, TrendingUp, Clock, Zap, AlertCircle, FileText, Download } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import { filterByRole } from '../dashboard/Dashboard';

export const AnalyticsView = () => {
  const { prs, role, branch } = useProcurement();
  const visiblePRs = filterByRole(prs, role, branch);

  const handleExport = (type: 'Excel' | 'PDF') => {
    const btn = document.activeElement as HTMLButtonElement;
    const originalText = btn.innerText;
    btn.innerText = `Generating ${type}...`;
    btn.disabled = true;

    const headers = ['PR ID', 'Department', 'Amount (Est)', 'Category', 'Priority', 'Status', 'CreatedAt', 'Rejection Reason', 'Full Audit History'];

    const rows = visiblePRs.map(pr => {
      const historyStr = pr.history.map(h =>
        `[${new Date(h.timestamp).toLocaleString()}] ${h.stage}: ${h.action} (${h.userRole})${h.notes ? ' - ' + h.notes : ''}`
      ).join('; ');

      const lastRejection = pr.history.reverse().find(h => h.rejectionReason);

      return [
        pr.id,
        pr.department,
        pr.price || 0,
        pr.category,
        pr.priority,
        pr.status,
        new Date(pr.createdAt).toLocaleDateString(),
        lastRejection?.rejectionReason || 'N/A',
        `"${historyStr}"`
      ];
    });

    const csvData = [headers, ...rows];
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    setTimeout(() => {
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Pro-Biz_Procurement_Audit_${new Date().getTime()}.${type === 'Excel' ? 'csv' : 'txt'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      btn.innerText = originalText;
      btn.disabled = false;
    }, 1000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-blue-600" />
            Strategic Analytics
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">High-level procurement intelligence & financial performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('Excel')}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg. TAT (Total)', value: '4.2h', change: '-12%', trend: 'up', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Procurement Efficiency', value: '94%', change: '+5%', trend: 'up', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Revisions', value: '18', change: '+2', trend: 'down', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Spend (MTD)', value: 'AED 1.2M', change: '+18%', trend: 'up', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-default">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full tracking-tighter ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Comprehensive Procurement Data</h3>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-widest">{visiblePRs.length} Total Records</p>
          </div>
          <div className="flex gap-2">
            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-600 font-bold">
              <option>All Departments</option>
              {Array.from(new Set(visiblePRs.map(p => p.department))).map(d => <option key={d}>{d}</option>)}
            </select>
            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-600 font-bold">
              <option>All Statuses</option>
              {Array.from(new Set(visiblePRs.map(p => p.status))).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm shadow-sm">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4 border-b border-slate-200">PR Reference</th>
                <th className="p-4 border-b border-slate-200">Department / Branch</th>
                <th className="p-4 border-b border-slate-200">Category</th>
                <th className="p-4 border-b border-slate-200">Initiated Date</th>
                <th className="p-4 border-b border-slate-200 text-right">Est. Value (AED)</th>
                <th className="p-4 border-b border-slate-200 text-center">TAT Status</th>
                <th className="p-4 border-b border-slate-200">Current Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visiblePRs.sort((a, b) => b.createdAt - a.createdAt).map(pr => {
                const isOverdue = pr.slaDeadline < Date.now() && !['Closed - Completed', 'Delivered'].includes(pr.status);
                const isClosed = ['Closed - Completed', 'Delivered'].includes(pr.status);
                const tatColor = isClosed ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : isOverdue ? 'text-rose-500 bg-rose-50 border-rose-100 animate-pulse' : 'text-blue-500 bg-blue-50 border-blue-100';

                return (
                  <tr key={pr.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="p-4">
                      <span className="font-mono font-black text-blue-700 text-sm">{pr.id}</span>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${pr.priority === 'Emergency' ? 'bg-rose-500' : pr.priority === 'High' ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                        {pr.priority}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-700">{pr.department}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{pr.branch}</p>
                    </td>
                    <td className="p-4 text-xs text-slate-600 font-medium">
                      {pr.category}
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">{pr.itemName}</p>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(pr.createdAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      {pr.price ? (
                        <span className="font-black text-slate-800 text-sm">{pr.price.toLocaleString('en-AE')}</span>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${tatColor}`}>
                        {isClosed ? 'Resolved' : isOverdue ? 'Breached' : 'On Track'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${pr.status.includes('Rejected') ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        pr.status.includes('Closed') || pr.status === 'Delivered' || pr.status === 'GRN Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          pr.status.includes('Pending') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {pr.status.replace('Pending - ', '')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
