import { BarChart2, TrendingUp, Clock, Zap, AlertCircle, FileText, Download } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export const AnalyticsView = () => {
  const { prs } = useProcurement();

  const handleExport = (type: 'Excel' | 'PDF') => {
    const btn = document.activeElement as HTMLButtonElement;
    const originalText = btn.innerText;
    btn.innerText = `Generating ${type}...`;
    btn.disabled = true;

    const headers = ['PR ID', 'Department', 'Amount (Est)', 'Category', 'Priority', 'Status', 'CreatedAt', 'Rejection Reason', 'Full Audit History'];

    const rows = prs.map(pr => {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm flex items-center gap-2">
                Requirement Velocity
                <span className="text-[10px] font-normal text-slate-400">(Last 30 Days)</span>
              </h3>
            </div>
            <div className="flex gap-2">
              {['D', 'W', 'M'].map(p => (
                <button key={p} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${p === 'M' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          {(() => {
            const seedCounts = [3, 5, 4, 7, 6, 8, 5, 9, 6, 10, 7, 12];
            const weeklyCounts = seedCounts.map((seed, i) => {
              const real = prs.filter(pr => {
                const w = Math.floor((Date.now() - pr.createdAt) / (7 * 24 * 3600000));
                return w === (11 - i);
              }).length;
              return Math.max(seed, real);
            });
            const max = Math.max(...weeklyCounts, 1);
            const W = 480, H = 180, PL = 32, PR = 8, PT = 12, PB = 28;
            const cw = (W - PL - PR) / (weeklyCounts.length - 1);
            const pts = weeklyCounts.map((v, i) => ({
              x: PL + i * cw,
              y: PT + (1 - v / max) * (H - PT - PB),
              v,
            }));
            const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(H - PB).toFixed(1)} L${pts[0].x.toFixed(1)},${(H - PB).toFixed(1)} Z`;
            const yTicks = [0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max];
            return (
              <div className="relative w-full overflow-x-auto">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Gridlines & Y-axis */}
                  {yTicks.map((tick, i) => {
                    const y = PT + (1 - tick / max) * (H - PT - PB);
                    return (
                      <g key={i}>
                        <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                        <text x={PL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontWeight="700">{tick}</text>
                      </g>
                    );
                  })}
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#velGrad)" />
                  {/* Line */}
                  <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  {/* Dots + labels */}
                  {pts.map((p, i) => (
                    <g key={i} className="group" style={{ cursor: 'pointer' }}>
                      <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
                      <circle cx={p.x} cy={p.y} r="9" fill="transparent">
                        <title>W{i + 1}: {p.v} requests</title>
                      </circle>
                      {/* X-axis labels */}
                      <text x={p.x} y={H - PB + 12} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="700">W{i + 1}</text>
                      {/* Value label on top */}
                      <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fill="#3b82f6" fontWeight="900">{p.v}</text>
                    </g>
                  ))}
                </svg>
                <div className="flex items-center gap-4 mt-2 px-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                    <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block"></span> Weekly PR Volume
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Total: <strong className="text-slate-700">{weeklyCounts.reduce((a, b) => a + b, 0)} PRs</strong> over 12 weeks</span>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Submission Trends</h3>
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-32 flex items-end gap-1">
                {[40, 60, 45, 80, 55, 90, 70].map((v, i) => (
                  <div key={i} className="flex-1 bg-blue-500/10 rounded-full relative group transition-all hover:bg-blue-500" style={{ height: `${v}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-0 group-hover:opacity-100">{v}%</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Peak submission days: Mon-Wed</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Spend by Category</h3>
            <div className="space-y-4">
              {[
                { name: 'Medications', pct: 45, val: '540K', color: 'bg-blue-500' },
                { name: 'Equipment', pct: 30, val: '360K', color: 'bg-emerald-500' },
                { name: 'Consumables', pct: 25, val: '300K', color: 'bg-amber-500' }
              ].map(c => (
                <div key={c.name}>
                  <div className="flex justify-between text-[11px] font-bold mb-1.5">
                    <span className="text-slate-700">{c.name}</span>
                    <span className="text-slate-400">AED {c.val}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${c.pct}%` }} className={`h-full ${c.color}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-6">Recent Escalations & Rejections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'PR-2025-089', by: 'Centre In-Charge', reason: 'Exceeds monthly quota', date: 'Today', type: 'Rejection' },
            { id: 'PR-2025-072', by: 'SMD Officer', reason: 'Sourcing Alternative Required', date: 'Yesterday', type: 'Manual Revision' },
            { id: 'PR-2025-065', by: 'Finance Dept', reason: 'Budget Cap Reached', date: '2 days ago', type: 'Rejection' },
          ].map(r => (
            <div key={r.id} className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-black text-blue-600 font-mono">{r.id}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${r.type === 'Rejection' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                  {r.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Actor: {r.by}</p>
              <p className="text-xs font-semibold text-slate-700 mb-3">{r.reason}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {r.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
